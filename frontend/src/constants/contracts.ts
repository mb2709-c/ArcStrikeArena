import type { Address } from "viem";

export const ARC_STRIKE_ARENA_ADDRESS: Address =
  "0x0c6bf68f0CC59F0FBb93b7F51fA8caC756e04ABD";

export const ARC_STRIKE_ARENA_ABI = [
  // ========== WRITE FUNCTIONS ==========
  {
    type: "function",
    name: "createReplicaDuel",
    stateMutability: "nonpayable",
    inputs: [
      { name: "duelId", type: "string" },
      { name: "fighterA", type: "string" },
      { name: "fighterB", type: "string" },
      { name: "stakeAmount", type: "uint256" },
      { name: "duration", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "placeReplicaBet",
    stateMutability: "payable",
    inputs: [
      { name: "duelId", type: "string" },
      { name: "side", type: "uint8" },
      { name: "encryptedSkill", type: "bytes32" },
      { name: "inputProof", type: "bytes" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "settleReplicaDuel",
    stateMutability: "nonpayable",
    inputs: [{ name: "duelId", type: "string" }],
    outputs: []
  },
  {
    type: "function",
    name: "cancelReplicaDuel",
    stateMutability: "nonpayable",
    inputs: [{ name: "duelId", type: "string" }],
    outputs: []
  },
  {
    type: "function",
    name: "claimReplicaPrize",
    stateMutability: "nonpayable",
    inputs: [{ name: "duelId", type: "string" }],
    outputs: []
  },
  {
    type: "function",
    name: "claimReplicaRefund",
    stateMutability: "nonpayable",
    inputs: [{ name: "duelId", type: "string" }],
    outputs: []
  },

  // ========== READ FUNCTIONS ==========
  {
    type: "function",
    name: "listReplicaDuels",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string[]" }]
  },
  {
    type: "function",
    name: "getReplicaDuel",
    stateMutability: "view",
    inputs: [{ name: "duelId", type: "string" }],
    outputs: [
      { name: "fighterA", type: "string" },
      { name: "fighterB", type: "string" },
      { name: "stakeAmount", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "prizePool", type: "uint256" },
      { name: "settled", type: "bool" },
      { name: "cancelled", type: "bool" },
      { name: "winningSide", type: "uint8" },
      { name: "supportersA", type: "uint256" },
      { name: "supportersB", type: "uint256" }
    ]
  },
  {
    type: "function",
    name: "getReplicaBetCipher",
    stateMutability: "view",
    inputs: [
      { name: "duelId", type: "string" },
      { name: "user", type: "address" }
    ],
    outputs: [{ name: "", type: "bytes32" }]
  },

  // ========== CONSTANTS ==========
  {
    type: "function",
    name: "MIN_STAKE",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "MIN_DURATION",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "MAX_DURATION",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },

  // ========== EVENTS ==========
  {
    type: "event",
    name: "DuelCreated",
    inputs: [
      { name: "duelId", type: "string", indexed: true },
      { name: "stakeAmount", type: "uint256", indexed: false },
      { name: "deadline", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "BetPlaced",
    inputs: [
      { name: "duelId", type: "string", indexed: true },
      { name: "bettor", type: "address", indexed: true },
      { name: "side", type: "uint8", indexed: false }
    ]
  },
  {
    type: "event",
    name: "DuelSettled",
    inputs: [
      { name: "duelId", type: "string", indexed: true },
      { name: "winningSide", type: "uint8", indexed: false }
    ]
  },
  {
    type: "event",
    name: "DuelCancelled",
    inputs: [{ name: "duelId", type: "string", indexed: true }]
  },
  {
    type: "event",
    name: "PrizeClaimed",
    inputs: [
      { name: "duelId", type: "string", indexed: true },
      { name: "winner", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "RefundClaimed",
    inputs: [
      { name: "duelId", type: "string", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },

  // ========== ERRORS ==========
  { type: "error", name: "DuelExists", inputs: [] },
  { type: "error", name: "DuelMissing", inputs: [] },
  { type: "error", name: "InvalidStake", inputs: [] },
  { type: "error", name: "InvalidSide", inputs: [] },
  { type: "error", name: "BettingClosed", inputs: [] },
  { type: "error", name: "AlreadyBet", inputs: [] },
  { type: "error", name: "AlreadySettled", inputs: [] },
  { type: "error", name: "NotSettled", inputs: [] },
  { type: "error", name: "NotWinner", inputs: [] },
  { type: "error", name: "AlreadyClaimed", inputs: [] },
  { type: "error", name: "NotRefundable", inputs: [] },
  { type: "error", name: "Locked", inputs: [] },
] as const;
