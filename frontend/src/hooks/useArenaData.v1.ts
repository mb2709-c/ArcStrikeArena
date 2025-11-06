/**
 * Arc Strike Arena Data Hooks
 * Wrapper around real contract hooks for compatibility with existing components
 * Original mock data moved to useArenaData.mock.ts
 */

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { parseEther } from "viem";

import { useArenaStore } from "@/store/useArenaStore";
import type {
  ArenaRole,
  BetPosition,
  DuelDetail,
  DuelStatus,
  DuelSummary,
  FighterProfile,
  RevealJob,
  TransactionBanner
} from "@/types";

import {
  useIsContractDeployed,
  useDuel,
  useBetCipher,
  useListDuels,
  useWatchDuelCreated,
  useWatchBetPlaced,
  useWatchDuelSettled,
  useWatchPrizeClaimed
} from "./useArenaContract";

import { ARC_STRIKE_ARENA_ADDRESS, ARC_STRIKE_ARENA_ABI } from "../constants/contracts";
import { encryptSkill } from "../lib/fhe";

// ==================== ROLE MANAGEMENT ====================

export function useArenaRole(): { role: ArenaRole } {
  const { address } = useAccount();
  const { role } = useArenaStore();

  // TODO: Implement organizer detection from contract
  // For now, return role from store
  return { role };
}

export function isOrganizer(role: ArenaRole) {
  return role === "organizer";
}

// ==================== ARENA HALL (LIST) ====================

export function useArenaHall() {
  const { duelIds, isLoading, error, refetch } = useListDuels();

  // Convert duel IDs to summaries
  // Note: For better UX, you might want to batch-fetch all duel details
  const duels: DuelSummary[] = duelIds.map((id) => ({
    duelId: id,
    fighters: [
      {
        id: "fighter-a",
        name: "Fighter A",
        handle: "@fightera",
        winRate: 0.5,
        streak: 0,
        avatarColor: "#7027E0"
      },
      {
        id: "fighter-b",
        name: "Fighter B",
        handle: "@fighterb",
        winRate: 0.5,
        streak: 0,
        avatarColor: "#2BF4FF"
      }
    ] as [FighterProfile, FighterProfile],
    stake: 0,
    prizePool: 0,
    supporters: 0,
    timeLeft: 0,
    status: "Open" as DuelStatus
  }));

  return {
    data: duels,
    isLoading,
    error,
    refetch
  };
}

// ==================== DUEL DETAIL ====================

export function useDuelDetail(duelId?: string) {
  const { duel, isLoading, refetch } = useDuel(duelId);

  if (!duelId || !duel) {
    return {
      data: undefined,
      isLoading,
      error: null,
      refetch
    };
  }

  // Determine status
  let status: DuelStatus = "Open";
  const now = Math.floor(Date.now() / 1000);
  const deadline = Number(duel.deadline);

  if (duel.cancelled) {
    status = "Cancelled";
  } else if (duel.settled) {
    status = "Revealed";
  } else if (now >= deadline) {
    status = "RevealPending";
  }

  // Calculate time left
  const timeLeft = Math.max(0, deadline - now);

  // Build fighter profiles
  const fighters: [FighterProfile, FighterProfile] = [
    {
      id: "fighter-a",
      name: duel.fighterA,
      handle: `@${duel.fighterA.toLowerCase().replace(/\s+/g, "")}`,
      winRate: 0.5,
      streak: 0,
      avatarColor: "#7027E0"
    },
    {
      id: "fighter-b",
      name: duel.fighterB,
      handle: `@${duel.fighterB.toLowerCase().replace(/\s+/g, "")}`,
      winRate: 0.5,
      streak: 0,
      avatarColor: "#2BF4FF"
    }
  ];

  // Build timeline
  const timeline = [
    { label: "Duel Created", timestamp: new Date().toISOString() },
    deadline > 0 ? { label: "Betting Closed", timestamp: new Date(deadline * 1000).toISOString() } : null,
    duel.settled ? { label: "Results Revealed", timestamp: new Date().toISOString() } : null
  ].filter(Boolean) as Array<{ label: string; timestamp: string }>;

  // Calculate reveal ratio
  let revealRatio: number | undefined;
  if (duel.settled && duel.revealedA !== undefined && duel.revealedB !== undefined) {
    const total = Number(duel.revealedA) + Number(duel.revealedB);
    if (total > 0) {
      revealRatio = Number(duel.revealedA) / total;
    }
  }

  const detail: DuelDetail = {
    duelId,
    fighters,
    stake: Number(duel.stakeAmount) / 1e18,
    prizePool: Number(duel.prizePool) / 1e18,
    supporters: 0, // TODO: Track total supporters count
    timeLeft,
    status,
    description: `${duel.fighterA} vs ${duel.fighterB}`,
    revealPending: !duel.settled && now >= deadline,
    timeline,
    revealedA: duel.settled ? Number(duel.revealedA) : undefined,
    revealedB: duel.settled ? Number(duel.revealedB) : undefined,
    revealRatio
  };

  return {
    data: detail,
    isLoading,
    error: null,
    refetch
  };
}

// ==================== BET POSITIONS ====================

export function useBetPositions() {
  const { address } = useAccount();
  const { duelIds } = useListDuels();

  // TODO: For better implementation, maintain a user position index in contract
  // For now, return empty array (components should handle gracefully)
  const positions: BetPosition[] = [];

  return {
    data: positions,
    isLoading: false,
    error: null
  };
}

// ==================== REVEAL JOBS ====================

export function useRevealJobs() {
  // TODO: Track reveal requests
  const jobs: RevealJob[] = [];

  return {
    data: jobs,
    isLoading: false,
    error: null
  };
}

// ==================== BANNER STATE ====================

interface BannerStore {
  banner: TransactionBanner | null;
  setBanner: (banner: TransactionBanner | null) => void;
}

const useBannerStore = create<BannerStore>((set) => ({
  banner: null,
  setBanner: (banner) => set({ banner })
}));

export function useBanner() {
  const { banner, setBanner } = useBannerStore();
  return { banner, setBanner };
}

// ==================== ACTIONS ====================

export function useArenaActions(duelId: string) {
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });
  const queryClient = useQueryClient();
  const { setBanner } = useBanner();
  const { address } = useAccount();
  const { duel } = useDuel(duelId);

  // Watch for transaction confirmation
  if (isConfirmed && txHash) {
    queryClient.invalidateQueries({ queryKey: ["arena", "duel-detail", duelId] });
    queryClient.invalidateQueries({ queryKey: ["arena", "positions"] });
  }

  return {
    placeBet: {
      mutate: async (data: { side: number; weight: number }) => {
        if (!address || !duel) {
          setBanner({ type: "error", message: "Wallet not connected or duel not found" });
          return;
        }

        setBanner({ type: "pending", message: "Placing bet with encrypted skill..." });

        try {
          // Encrypt the skill value
          const { handle, proof } = await encryptSkill(
            BigInt(data.weight),
            ARC_STRIKE_ARENA_ADDRESS,
            address
          );

          writeContract({
            address: ARC_STRIKE_ARENA_ADDRESS,
            abi: ARC_STRIKE_ARENA_ABI,
            functionName: "placeReplicaBet",
            args: [duelId, data.side, handle, proof],
            value: duel.stakeAmount
          });

          setBanner({
            type: "success",
            message: "Bet placed successfully!",
            txHash: txHash
          });
        } catch (error: any) {
          setBanner({ type: "error", message: error.message || "Bet placement failed" });
        }
      },
      isPending: isPending || isConfirming
    },

    requestReveal: {
      mutate: () => {
        if (!address) {
          setBanner({ type: "error", message: "Wallet not connected" });
          return;
        }

        setBanner({ type: "pending", message: "Requesting FHE reveal..." });

        try {
          writeContract({
            address: ARC_STRIKE_ARENA_ADDRESS,
            abi: ARC_STRIKE_ARENA_ABI,
            functionName: "requestReplicaReveal",
            args: [duelId]
          });

          setBanner({
            type: "success",
            message: "Reveal requested. Waiting for decryption...",
            txHash: txHash
          });
        } catch (error: any) {
          setBanner({ type: "error", message: error.message || "Reveal request failed" });
        }
      },
      isPending: isPending || isConfirming
    },

    cancelDuel: {
      mutate: () => {
        if (!address) {
          setBanner({ type: "error", message: "Wallet not connected" });
          return;
        }

        setBanner({ type: "pending", message: "Cancelling duel..." });

        try {
          writeContract({
            address: ARC_STRIKE_ARENA_ADDRESS,
            abi: ARC_STRIKE_ARENA_ABI,
            functionName: "cancelReplicaDuel",
            args: [duelId]
          });

          setBanner({
            type: "success",
            message: "Duel cancelled. Refunds available.",
            txHash: txHash
          });
        } catch (error: any) {
          setBanner({ type: "error", message: error.message || "Cancellation failed" });
        }
      },
      isPending: isPending || isConfirming
    },

    claimPrize: {
      mutate: () => {
        if (!address) {
          setBanner({ type: "error", message: "Wallet not connected" });
          return;
        }

        setBanner({ type: "pending", message: "Claiming prize..." });

        try {
          writeContract({
            address: ARC_STRIKE_ARENA_ADDRESS,
            abi: ARC_STRIKE_ARENA_ABI,
            functionName: "claimReplicaPrize",
            args: [duelId]
          });

          setBanner({
            type: "success",
            message: "Prize claimed successfully!",
            txHash: txHash
          });
        } catch (error: any) {
          setBanner({ type: "error", message: error.message || "Prize claim failed" });
        }
      },
      isPending: isPending || isConfirming
    },

    claimRefund: {
      mutate: () => {
        if (!address) {
          setBanner({ type: "error", message: "Wallet not connected" });
          return;
        }

        setBanner({ type: "pending", message: "Requesting refund..." });

        try {
          writeContract({
            address: ARC_STRIKE_ARENA_ADDRESS,
            abi: ARC_STRIKE_ARENA_ABI,
            functionName: "claimReplicaRefund",
            args: [duelId]
          });

          setBanner({
            type: "success",
            message: "Refund claimed successfully!",
            txHash: txHash
          });
        } catch (error: any) {
          setBanner({ type: "error", message: error.message || "Refund failed" });
        }
      },
      isPending: isPending || isConfirming
    }
  };
}

// ==================== UTILITY FUNCTIONS ====================

export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "Closed";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export function friendlyTime(value: string): string {
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
}

export function fighterGradient(color: string): string {
  return `linear-gradient(135deg, ${color}40 0%, transparent 100%)`;
}
