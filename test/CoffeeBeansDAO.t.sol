// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/GovernanceToken.sol";
import "../contracts/CoffeeBeansDAO.sol";

contract CoffeeBeansDAOTest is Test {
    GovernanceToken public token;
    CoffeeBeansDAO public dao;

    address alice = address(0xa);
    address bob = address(0xb);

    function setUp() public {
        token = new GovernanceToken("Coffee DAO", "COF", 1000 ether);
        dao = new CoffeeBeansDAO(address(token));

        token.transfer(alice, 100 ether);  // sqrt(100) = 10 voting power
        token.transfer(bob, 25 ether);     // sqrt(25) = 5 voting power
    }

    function test_QuadraticVotingPower() public view {
        // sqrt(100e18) = 10e9, sqrt(25e18) = 5e9 (quadratic: 1 vote per token square rooted)
        assertEq(dao.getVotingPower(alice), 10e9);
        assertEq(dao.getVotingPower(bob), 5e9);
    }

    function test_SubmitProposalAndVote() public {
        vm.prank(alice);
        uint256 proposalId = dao.submitProposal(
            "Order Ethiopian Yirgacheffe for Q1",
            "Ethiopian Yirgacheffe",
            500,           // 500 kg
            1e18,          // 1 ether per kg
            7 days
        );
        assertEq(proposalId, 1);

        vm.prank(alice);
        dao.vote(1, true);
        vm.prank(bob);
        dao.vote(1, false);

        (bool passed,,) = dao.getProposalResult(1);
        assertTrue(passed);  // 10 > 5, so yes wins
    }

    function test_ExecuteProposal() public {
        vm.prank(alice);
        dao.submitProposal("Order beans", "Colombian", 200, 0.5 ether, 1 days);

        vm.prank(alice);
        dao.vote(1, true);
        vm.prank(bob);
        dao.vote(1, false);

        vm.warp(block.timestamp + 1 days + 1);
        dao.executeProposal(1);

        CoffeeBeansDAO.Proposal memory p = dao.getProposal(1);
        assertTrue(p.executed);
        assertTrue(p.passed);
    }
}
