// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/GovernanceToken.sol";
import "../contracts/CoffeeBeansDAO.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        GovernanceToken token = new GovernanceToken(
            "Coffee DAO",
            "COF",
            1_000_000 ether
        );

        CoffeeBeansDAO dao = new CoffeeBeansDAO(address(token));

        vm.stopBroadcast();

        console.log("GovernanceToken deployed at:", address(token));
        console.log("CoffeeBeansDAO  deployed at:", address(dao));
    }
}
