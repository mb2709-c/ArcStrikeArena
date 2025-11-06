/**
 * Real contract hooks for Arc Strike Arena
 * Handles all blockchain interactions for PvP betting
 */

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { parseEther } from "viem";
import { ARC_STRIKE_ARENA_ADDRESS, ARC_STRIKE_ARENA_ABI } from "../constants/contracts";
import { encryptSkill, type EncryptedSkillPayload } from "../lib/fhe";

// ==================== READ HOOKS ====================

/**
 * Check if contract is deployed (has code)
 */
export function useIsContractDeployed() {
  const { data: code } = useReadContract({
    address: ARC_STRIKE_ARENA_ADDRESS,
    abi: [{ type: "function", name: "listReplicaDuels", stateMutability: "view", inputs: [], outputs: [{ type: "string[]" }] }],
    functionName: "listReplicaDuels"
  });

  return {
    isDeployed: code !== undefined && ARC_STRIKE_ARENA_ADDRESS !== "0x0000000000000000000000000000000000000000"
  };
}

/**
 * List all duel IDs
 */
export function useListDuels() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: ARC_STRIKE_ARENA_ADDRESS,
    abi: ARC_STRIKE_ARENA_ABI,
    functionName: "listReplicaDuels"
  });

  return {
    duelIds: data || [],
    isLoading,
    error,
    refetch
  };
}

/**
 * Get duel details
 */
export function useDuel(duelId: string | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: ARC_STRIKE_ARENA_ADDRESS,
    abi: ARC_STRIKE_ARENA_ABI,
    functionName: "getReplicaDuel",
    args: duelId ? [duelId] : undefined,
    query: {
      enabled: !!duelId
    }
  });

  return {
    duel: data
      ? {
          fighterA: data[0],
          fighterB: data[1],
          stakeAmount: data[2],
          deadline: data[3],
          prizePool: data[4],
          settled: data[5],
          cancelled: data[6],
          winningSide: data[7],
          supportersA: data[8],
          supportersB: data[9]
        }
      : undefined,
    isLoading,
    error,
    refetch
  };
}

/**
 * Get user's encrypted bet cipher
 */
export function useBetCipher(duelId: string | undefined, userAddress: string | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: ARC_STRIKE_ARENA_ADDRESS,
    abi: ARC_STRIKE_ARENA_ABI,
    functionName: "getReplicaBetCipher",
    args: duelId && userAddress ? [duelId, userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!duelId && !!userAddress
    }
  });

  return {
    cipher: data,
    isLoading,
    error,
    refetch
  };
}

// ==================== WRITE HOOKS ====================

/**
 * All mutation hooks for contract interactions
 */
export function useArenaMutations() {
  const { address } = useAccount();
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  /**
   * Create a new duel
   */
  const createDuel = useMutation({
    mutationFn: async ({
      duelId,
      fighterA,
      fighterB,
      stakeAmount,
      duration
    }: {
      duelId: string;
      fighterA: string;
      fighterB: string;
      stakeAmount: number;
      duration: number;
    }) => {
      if (!address) throw new Error("Wallet not connected");

      writeContract({
        address: ARC_STRIKE_ARENA_ADDRESS,
        abi: ARC_STRIKE_ARENA_ABI,
        functionName: "createReplicaDuel",
        args: [duelId, fighterA, fighterB, parseEther(stakeAmount.toString()), BigInt(duration)]
      });

      return { duelId, fighterA, fighterB };
    }
  });

  /**
   * Place a bet with encrypted skill
   */
  const placeBet = useMutation({
    mutationFn: async ({
      duelId,
      side,
      stakeAmount,
      encryptedPayload,
      skill
    }: {
      duelId: string;
      side: number;
      stakeAmount: bigint | number | string;
      encryptedPayload?: EncryptedSkillPayload;
      skill?: number | bigint;
    }) => {
      if (!address) throw new Error("Wallet not connected");

      let payload = encryptedPayload;
      if (!payload) {
        if (skill === undefined) {
          throw new Error("Missing encrypted payload");
        }
        const normalizedSkill = typeof skill === "bigint" ? skill : BigInt(skill);
        payload = await encryptSkill(normalizedSkill, ARC_STRIKE_ARENA_ADDRESS, address);
      }

      const value =
        typeof stakeAmount === "bigint"
          ? stakeAmount
          : parseEther(stakeAmount.toString());

      writeContract({
        address: ARC_STRIKE_ARENA_ADDRESS,
        abi: ARC_STRIKE_ARENA_ABI,
        functionName: "placeReplicaBet",
        args: [duelId, side, payload.handle, payload.proof],
        value
      });

      return { duelId, side };
    }
  });

  /**
   * Settle duel (anyone can call after deadline)
   */
  const settleDuel = useMutation({
    mutationFn: async ({ duelId }: { duelId: string }) => {
      if (!address) throw new Error("Wallet not connected");

      writeContract({
        address: ARC_STRIKE_ARENA_ADDRESS,
        abi: ARC_STRIKE_ARENA_ABI,
        functionName: "settleReplicaDuel",
        args: [duelId]
      });

      return { duelId };
    }
  });

  /**
   * Cancel duel (anyone can call after deadline)
   */
  const cancelDuel = useMutation({
    mutationFn: async ({ duelId }: { duelId: string }) => {
      if (!address) throw new Error("Wallet not connected");

      writeContract({
        address: ARC_STRIKE_ARENA_ADDRESS,
        abi: ARC_STRIKE_ARENA_ABI,
        functionName: "cancelReplicaDuel",
        args: [duelId]
      });

      return { duelId };
    }
  });

  /**
   * Claim prize (winners only)
   */
  const claimPrize = useMutation({
    mutationFn: async ({ duelId }: { duelId: string }) => {
      if (!address) throw new Error("Wallet not connected");

      writeContract({
        address: ARC_STRIKE_ARENA_ADDRESS,
        abi: ARC_STRIKE_ARENA_ABI,
        functionName: "claimReplicaPrize",
        args: [duelId]
      });

      return { duelId };
    }
  });

  /**
   * Claim refund (cancelled or draw)
   */
  const claimRefund = useMutation({
    mutationFn: async ({ duelId }: { duelId: string }) => {
      if (!address) throw new Error("Wallet not connected");

      writeContract({
        address: ARC_STRIKE_ARENA_ADDRESS,
        abi: ARC_STRIKE_ARENA_ABI,
        functionName: "claimReplicaRefund",
        args: [duelId]
      });

      return { duelId };
    }
  });

  return {
    createDuel,
    placeBet,
    settleDuel,
    cancelDuel,
    claimPrize,
    claimRefund,
    txHash,
    isPending,
    isConfirming,
    isConfirmed,
    writeError
  };
}

// ==================== EVENT WATCHERS ====================

/**
 * Watch for DuelCreated events
 */
export function useWatchDuelCreated(onEvent: (event: any) => void) {
  useWatchContractEvent({
    address: ARC_STRIKE_ARENA_ADDRESS,
    abi: ARC_STRIKE_ARENA_ABI,
    eventName: "DuelCreated",
    onLogs: (logs) => {
      logs.forEach((log) => onEvent(log));
    }
  });
}

/**
 * Watch for BetPlaced events
 */
export function useWatchBetPlaced(onEvent: (event: any) => void) {
  useWatchContractEvent({
    address: ARC_STRIKE_ARENA_ADDRESS,
    abi: ARC_STRIKE_ARENA_ABI,
    eventName: "BetPlaced",
    onLogs: (logs) => {
      logs.forEach((log) => onEvent(log));
    }
  });
}

/**
 * Watch for DuelSettled events
 */
export function useWatchDuelSettled(onEvent: (event: any) => void) {
  useWatchContractEvent({
    address: ARC_STRIKE_ARENA_ADDRESS,
    abi: ARC_STRIKE_ARENA_ABI,
    eventName: "DuelSettled",
    onLogs: (logs) => {
      logs.forEach((log) => onEvent(log));
    }
  });
}

/**
 * Watch for PrizeClaimed events
 */
export function useWatchPrizeClaimed(onEvent: (event: any) => void) {
  useWatchContractEvent({
    address: ARC_STRIKE_ARENA_ADDRESS,
    abi: ARC_STRIKE_ARENA_ABI,
    eventName: "PrizeClaimed",
    onLogs: (logs) => {
      logs.forEach((log) => onEvent(log));
    }
  });
}
