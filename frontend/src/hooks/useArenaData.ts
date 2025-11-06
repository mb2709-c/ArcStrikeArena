/**
 * Arc Strike Arena Data Hooks
 * Wrapper around real contract hooks for compatibility with existing components
 * Original mock data moved to useArenaData.mock.ts
 */

import { useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { toast } from "sonner";

import { useArenaStore } from "@/store/useArenaStore";
import type {
  ArenaRole,
  BetPosition,
  DuelDetail,
  DuelStatus,
  DuelSummary,
  FighterProfile,
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

const HANDLE_REGEX = /^0x[0-9a-fA-F]{64}$/;
const HEX_REGEX = /^0x[0-9a-fA-F]+$/;
const ENCRYPTION_TTL_MS = 60_000;

// ==================== ROLE MANAGEMENT ====================

export function useArenaRole() {
  const { role, setRole, selectedDuelId, setSelectedDuelId, filters, setFilters } = useArenaStore();

  return { role, setRole, selectedDuelId, setSelectedDuelId, filters, setFilters };
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
    status = "Settled";
  } else if (now >= deadline) {
    status = "Locked";
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
    duel.settled ? { label: "Duel Settled", timestamp: new Date().toISOString() } : null
  ].filter(Boolean) as Array<{ label: string; timestamp: string }>;

  const detail: DuelDetail = {
    duelId,
    fighters,
    stake: Number(duel.stakeAmount) / 1e18,
    prizePool: Number(duel.prizePool) / 1e18,
    supporters: Number(duel.supportersA) + Number(duel.supportersB),
    timeLeft,
    status,
    description: `${duel.fighterA} vs ${duel.fighterB}`,
    settled: duel.settled,
    winningSide: Number(duel.winningSide),
    timeline
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
  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isFailed } = useWaitForTransactionReceipt({ hash: txHash });
  const queryClient = useQueryClient();
  const { setBanner } = useBanner();
  const { address } = useAccount();
  const { duel } = useDuel(duelId);

  // Watch for transaction status changes
  useEffect(() => {
    if (txHash && isConfirmed) {
      toast.dismiss("bet-tx");
      toast.success("Transaction Confirmed!", {
        description: "Your bet was placed successfully",
        action: {
          label: "View on Etherscan",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${txHash}`, "_blank")
        },
        duration: 6000
      });
      queryClient.invalidateQueries({ queryKey: ["arena", "duel-detail", duelId] });
      queryClient.invalidateQueries({ queryKey: ["arena", "positions"] });
      reset();
    }
  }, [isConfirmed, txHash, queryClient, duelId, reset]);

  useEffect(() => {
    if (txHash && isFailed) {
      toast.dismiss("bet-tx");
      toast.error("Transaction Failed", {
        description: "Your transaction was reverted on-chain",
        action: {
          label: "View on Etherscan",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${txHash}`, "_blank")
        },
        duration: 8000
      });
      reset();
    }
  }, [isFailed, txHash, reset]);

  useEffect(() => {
    if (writeError) {
      toast.error("Transaction Error", {
        description: writeError.message || "Failed to send transaction"
      });
    }
  }, [writeError]);

  return {
    placeBet: {
      mutate: async (data: {
        fighterId: string;
        weight: number;
        handle: `0x${string}`;
        proof: `0x${string}`;
        encryptedAt: number;
      }) => {
        if (!address || !duel) {
          toast.error("Wallet not connected or duel not found");
          return;
        }

        if (Date.now() - data.encryptedAt > ENCRYPTION_TTL_MS) {
          toast.error("加密凭证已过期，请重新加密后再提交。");
          return;
        }

        if (!HANDLE_REGEX.test(data.handle)) {
          toast.error("FHE 句柄无效，请重新生成密文。");
          return;
        }

        const proofLooksValid = HEX_REGEX.test(data.proof) && (data.proof.length - 2) % 2 === 0;
        if (!proofLooksValid) {
          toast.error("密文证明格式错误，请重新加密。");
          return;
        }

        // Map fighterId to side (1 or 2)
        // fighter-a -> side 1, fighter-b -> side 2
        const side = data.fighterId === "fighter-a" ? 1 : 2;

        toast.loading("Submitting transaction...", { id: "bet-tx" });

        writeContract({
          address: ARC_STRIKE_ARENA_ADDRESS,
          abi: ARC_STRIKE_ARENA_ABI,
          functionName: "placeReplicaBet",
          args: [duelId, side, data.handle, data.proof],
          value: duel.stakeAmount
        }, {
          onSuccess: () => {
            toast.loading("Waiting for confirmation...", { id: "bet-tx" });
          },
          onError: (error) => {
            toast.dismiss("bet-tx");
          }
        });
      },
      isPending: isPending || isConfirming
    },

    settleDuel: {
      mutate: () => {
        if (!address) {
          setBanner({ type: "error", message: "Wallet not connected" });
          return;
        }

        setBanner({ type: "pending", message: "Settling duel..." });

        try {
          writeContract({
            address: ARC_STRIKE_ARENA_ADDRESS,
            abi: ARC_STRIKE_ARENA_ABI,
            functionName: "settleReplicaDuel",
            args: [duelId]
          });

          setBanner({
            type: "success",
            message: "Duel settled successfully!",
            txHash: txHash
          });
        } catch (error: any) {
          setBanner({ type: "error", message: error.message || "Settlement failed" });
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
