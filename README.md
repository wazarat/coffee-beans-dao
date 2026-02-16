# Coffee Beans DAO

A Solidity DAO for small businesses to meet larger **minimum order quantities (MOQs)** by prorating coffee bean orders. Uses **quadratic voting**: each member’s voting power is the square root of their token balance (1 vote per token square rooted).

## Features

- **Governance token (ERC20)** – Membership and voting power; weight = `sqrt(balance)`.
- **Proposals** – Members submit proposals for a collective coffee bean order (type, quantity in kg, price per kg).
- **Quadratic voting** – Vote yes/no on proposals; your vote weight = `sqrt(your token balance)`.
- **Autonomous execution** – After the voting period, anyone can call `executeProposal(id)` to finalize the outcome (pass/fail).
- **Winner** – A proposal passes iff total yes weight &gt; total no weight; `getProposalResult(id)` returns the result.

## Contracts

| Contract             | Role |
|----------------------|------|
| `GovernanceToken.sol` | ERC20 token; balance determines voting power (sqrt). |
| `CoffeeBeansDAO.sol`  | DAO: submit proposal, vote (quadratic), execute, get result. |

## Setup

```bash
npm install
forge install foundry-rs/forge-std --no-commit
forge build
```

Run tests: `forge test`

## Usage (conceptual)

1. Deploy `GovernanceToken` (name, symbol, initial supply). Optionally `mint` to members.
2. Deploy `CoffeeBeansDAO(governanceTokenAddress)`.
3. **Submit proposal**: `submitProposal(description, coffeeBeanType, quantityKg, pricePerKgWei, votingPeriodSeconds)`.
4. **Vote**: `vote(proposalId, support)` where `support` is `true` (yes) or `false` (no). Weight = `sqrt(token balance)`.
5. After `votingEndsAt`, anyone calls **execute**: `executeProposal(proposalId)`. Proposal is marked passed (yes &gt; no) or defeated.
6. **Result**: `getProposalResult(proposalId)` returns `(passed, yesWeight, noWeight)`; `getProposal(id)` returns full proposal.

Voting period must be between 1 and 30 days. Execution only records the outcome; actual order fulfillment (payments, prorating) is off-chain or via a separate contract.
