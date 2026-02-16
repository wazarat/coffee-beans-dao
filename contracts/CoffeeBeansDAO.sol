// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CoffeeBeansDAO
 * @dev DAO for small businesses to meet larger MOQs by prorating coffee bean orders.
 * Uses quadratic voting: voting power = sqrt(token balance). 1 vote per token square rooted.
 */
contract CoffeeBeansDAO {
    using Math for uint256;

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    IERC20 public immutable governanceToken;
    uint256 public constant MIN_VOTING_PERIOD = 1 days;
    uint256 public constant MAX_VOTING_PERIOD = 30 days;
    uint256 public proposalCount;

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        string coffeeBeanType;       // e.g. "Ethiopian Yirgacheffe"
        uint256 quantityKg;          // total kg of coffee beans to order
        uint256 pricePerKgWei;       // price per kg in wei
        uint256 votingEndsAt;
        bool executed;
        bool passed;
        uint256 totalYesWeight;      // sum of sqrt(voter balance) for yes
        uint256 totalNoWeight;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public votedYes;  // true = yes, false = no (only meaningful if hasVoted)

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        string coffeeBeanType,
        uint256 quantityKg,
        uint256 pricePerKgWei,
        uint256 votingEndsAt
    );
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalDefeated(uint256 indexed proposalId);

    error VotingPeriodEnded();
    error VotingPeriodActive();
    error AlreadyVoted();
    error AlreadyExecuted();
    error ProposalNotPassed();
    error ZeroWeight();
    error InvalidVotingPeriod();
    error InvalidProposal();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(address _governanceToken) {
        governanceToken = IERC20(_governanceToken);
    }

    // -------------------------------------------------------------------------
    // Quadratic voting: 1 vote per token square rooted
    // -------------------------------------------------------------------------

    /// @notice Returns the voting power of an account (sqrt of token balance).
    function getVotingPower(address account) public view returns (uint256) {
        uint256 balance = governanceToken.balanceOf(account);
        return balance == 0 ? 0 : balance.sqrt();
    }

    // -------------------------------------------------------------------------
    // Proposals
    // -------------------------------------------------------------------------

    /// @notice Submit a new proposal for a coffee bean order (MOQ prorate).
    /// @param description Human-readable description of the order.
    /// @param coffeeBeanType Type of coffee beans (e.g. "Ethiopian Yirgacheffe").
    /// @param quantityKg Total kg of coffee beans to order.
    /// @param pricePerKgWei Price per kg in wei.
    /// @param votingPeriodSeconds How long voting is open (seconds).
    function submitProposal(
        string calldata description,
        string calldata coffeeBeanType,
        uint256 quantityKg,
        uint256 pricePerKgWei,
        uint256 votingPeriodSeconds
    ) external returns (uint256 proposalId) {
        if (votingPeriodSeconds < MIN_VOTING_PERIOD || votingPeriodSeconds > MAX_VOTING_PERIOD) {
            revert InvalidVotingPeriod();
        }
        if (quantityKg == 0 || bytes(description).length == 0 || bytes(coffeeBeanType).length == 0) {
            revert InvalidProposal();
        }

        proposalId = ++proposalCount;
        uint256 votingEndsAt = block.timestamp + votingPeriodSeconds;

        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            description: description,
            coffeeBeanType: coffeeBeanType,
            quantityKg: quantityKg,
            pricePerKgWei: pricePerKgWei,
            votingEndsAt: votingEndsAt,
            executed: false,
            passed: false,
            totalYesWeight: 0,
            totalNoWeight: 0
        });

        emit ProposalCreated(
            proposalId,
            msg.sender,
            description,
            coffeeBeanType,
            quantityKg,
            pricePerKgWei,
            votingEndsAt
        );
        return proposalId;
    }

    /// @notice Vote on a proposal. Weight = sqrt(your token balance).
    /// @param proposalId The proposal id.
    /// @param support true = yes, false = no.
    function vote(uint256 proposalId, bool support) external {
        Proposal storage p = proposals[proposalId];
        if (p.id == 0) revert InvalidProposal();
        if (block.timestamp >= p.votingEndsAt) revert VotingPeriodEnded();
        if (hasVoted[proposalId][msg.sender]) revert AlreadyVoted();

        uint256 weight = getVotingPower(msg.sender);
        if (weight == 0) revert ZeroWeight();

        hasVoted[proposalId][msg.sender] = true;
        votedYes[proposalId][msg.sender] = support;

        if (support) {
            p.totalYesWeight += weight;
        } else {
            p.totalNoWeight += weight;
        }

        emit Voted(proposalId, msg.sender, support, weight);
    }

    /// @notice Get the current vote result (winner) for a proposal.
    /// @return passed true if yes votes (by quadratic weight) exceed no votes.
    /// @return yesWeight Total yes weight.
    /// @return noWeight Total no weight.
    function getProposalResult(uint256 proposalId)
        external
        view
        returns (bool passed, uint256 yesWeight, uint256 noWeight)
    {
        Proposal storage p = proposals[proposalId];
        if (p.id == 0) revert InvalidProposal();
        yesWeight = p.totalYesWeight;
        noWeight = p.totalNoWeight;
        passed = yesWeight > noWeight;
        return (passed, yesWeight, noWeight);
    }

    /// @notice Execute a proposal after voting has ended. Callable by anyone.
    /// Marks the proposal as executed and passed if yes > no; otherwise marks defeated.
    function executeProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        if (p.id == 0) revert InvalidProposal();
        if (block.timestamp < p.votingEndsAt) revert VotingPeriodActive();
        if (p.executed) revert AlreadyExecuted();

        p.executed = true;
        p.passed = p.totalYesWeight > p.totalNoWeight;

        if (p.passed) {
            emit ProposalExecuted(proposalId);
            // In a full system, here you would:
            // - trigger payment/order (e.g. pull funds from members proportionally)
            // - or emit event for off-chain order fulfillment
            // For this contract we only record the outcome; actual order is off-chain.
        } else {
            emit ProposalDefeated(proposalId);
        }
    }

    /// @notice Get full proposal details.
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    /// @notice Check if a proposal has passed (yes > no) and is executable. Does not require execution to have run.
    function proposalPassed(uint256 proposalId) external view returns (bool) {
        Proposal storage p = proposals[proposalId];
        if (p.id == 0) return false;
        return block.timestamp >= p.votingEndsAt && p.totalYesWeight > p.totalNoWeight;
    }
}
