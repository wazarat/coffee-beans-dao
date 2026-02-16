// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GovernanceToken
 * @dev ERC20 token used for membership and quadratic voting power in the Coffee Beans DAO.
 * Voting power = sqrt(balance), so 1 vote per token square rooted.
 */
contract GovernanceToken is ERC20, Ownable {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply_);
    }

    /// @notice Mint new tokens (e.g. when new members join or purchase membership)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
