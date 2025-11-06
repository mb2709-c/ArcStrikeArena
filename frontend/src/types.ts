export type ArenaRole = "organizer" | "supporter" | "spectator";

export type DuelStatus = "Open" | "Locked" | "Settled" | "Cancelled";

export interface FighterProfile {
  id: string;
  name: string;
  handle: string;
  winRate: number;
  streak: number;
  avatarColor: string;
}

export interface DuelSummary {
  duelId: string;
  fighters: [FighterProfile, FighterProfile];
  stake: number;
  prizePool: number;
  supporters: number;
  timeLeft: number;
  status: DuelStatus;
}

export interface DuelDetail extends DuelSummary {
  description: string;
  settled: boolean;
  winningSide: number; // 0 = draw, 1 = FighterA, 2 = FighterB
  timeline: Array<{
    label: string;
    timestamp: string;
  }>;
}

export interface BetPosition {
  duelId: string;
  supportedFighter: string;
  weight: number;
  claimed: boolean;
  refundable: boolean;
  cipherHandle: string;
}

export interface TransactionBanner {
  type: "success" | "error" | "info" | "pending";
  message: string;
  txHash?: string;
}



