// Contract addresses -- replace with your deployed addresses after running Deploy.s.sol on Sepolia
export const GOVERNANCE_TOKEN_ADDRESS =
  (process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

export const COFFEE_BEANS_DAO_ADDRESS =
  (process.env.NEXT_PUBLIC_DAO_ADDRESS as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

export const governanceTokenAbi = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
] as const;

export const coffeeBeansDAOAbi = [
  {
    type: "function",
    name: "proposalCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "governanceToken",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVotingPower",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getProposal",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "proposer", type: "address" },
          { name: "description", type: "string" },
          { name: "coffeeBeanType", type: "string" },
          { name: "quantityKg", type: "uint256" },
          { name: "pricePerKgWei", type: "uint256" },
          { name: "votingEndsAt", type: "uint256" },
          { name: "executed", type: "bool" },
          { name: "passed", type: "bool" },
          { name: "totalYesWeight", type: "uint256" },
          { name: "totalNoWeight", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getProposalResult",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [
      { name: "passed", type: "bool" },
      { name: "yesWeight", type: "uint256" },
      { name: "noWeight", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasVoted",
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "proposalPassed",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "submitProposal",
    inputs: [
      { name: "description", type: "string" },
      { name: "coffeeBeanType", type: "string" },
      { name: "quantityKg", type: "uint256" },
      { name: "pricePerKgWei", type: "uint256" },
      { name: "votingPeriodSeconds", type: "uint256" },
    ],
    outputs: [{ name: "proposalId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "vote",
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "support", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "executeProposal",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "ProposalCreated",
    inputs: [
      { name: "proposalId", type: "uint256", indexed: true },
      { name: "proposer", type: "address", indexed: true },
      { name: "description", type: "string", indexed: false },
      { name: "coffeeBeanType", type: "string", indexed: false },
      { name: "quantityKg", type: "uint256", indexed: false },
      { name: "pricePerKgWei", type: "uint256", indexed: false },
      { name: "votingEndsAt", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Voted",
    inputs: [
      { name: "proposalId", type: "uint256", indexed: true },
      { name: "voter", type: "address", indexed: true },
      { name: "support", type: "bool", indexed: false },
      { name: "weight", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProposalExecuted",
    inputs: [{ name: "proposalId", type: "uint256", indexed: true }],
    anonymous: false,
  },
  {
    type: "event",
    name: "ProposalDefeated",
    inputs: [{ name: "proposalId", type: "uint256", indexed: true }],
    anonymous: false,
  },
  { type: "error", name: "AlreadyExecuted", inputs: [] },
  { type: "error", name: "AlreadyVoted", inputs: [] },
  { type: "error", name: "InvalidProposal", inputs: [] },
  { type: "error", name: "InvalidVotingPeriod", inputs: [] },
  { type: "error", name: "ProposalNotPassed", inputs: [] },
  { type: "error", name: "VotingPeriodActive", inputs: [] },
  { type: "error", name: "VotingPeriodEnded", inputs: [] },
  { type: "error", name: "ZeroWeight", inputs: [] },
] as const;
