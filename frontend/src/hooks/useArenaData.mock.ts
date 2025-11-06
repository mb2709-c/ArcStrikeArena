import { formatDistanceToNow, subMinutes } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";

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

const BASE_FIGHTERS: FighterProfile[] = [
  { id: "archer-nova", name: "Nova Archer", handle: "@nova", winRate: 0.64, streak: 3, avatarColor: "#7027E0" },
  { id: "cyber-ryu", name: "Cyber Ryu", handle: "@ryu", winRate: 0.71, streak: 4, avatarColor: "#2BF4FF" },
  { id: "ember-lia", name: "Ember Lia", handle: "@lia", winRate: 0.59, streak: 2, avatarColor: "#ff4553" },
  { id: "ion-haze", name: "Ion Haze", handle: "@ion", winRate: 0.48, streak: 1, avatarColor: "#2BF4FF" }
];

const DUELS: DuelSummary[] = [
  {
    duelId: "ARC-511",
    fighters: [BASE_FIGHTERS[0], BASE_FIGHTERS[1]],
    stake: 0.05,
    prizePool: 54.2,
    supporters: 312,
    timeLeft: 2_700,
    status: "Open"
  },
  {
    duelId: "ARC-510",
    fighters: [BASE_FIGHTERS[2], BASE_FIGHTERS[3]],
    stake: 0.02,
    prizePool: 23.4,
    supporters: 167,
    timeLeft: 0,
    status: "RevealPending"
  },
  {
    duelId: "ARC-509",
    fighters: [BASE_FIGHTERS[0], BASE_FIGHTERS[2]],
    stake: 0.04,
    prizePool: 48.9,
    supporters: 244,
    timeLeft: 0,
    status: "Revealed"
  }
];

const DETAILS: Record<string, DuelDetail> = {
  "ARC-511": {
    ...DUELS[0],
    description: "Neon archery vs cyber blade showdown. Encrypted weights shape the final strike.",
    revealPending: false,
    timeline: [
      { label: "Duel announced", timestamp: subMinutes(new Date(), 80).toISOString() },
      { label: "Betting live", timestamp: subMinutes(new Date(), 75).toISOString() }
    ]
  },
  "ARC-510": {
    ...DUELS[1],
    description: "Ember Lia faces Ion Haze in a rapid-fire special with stealth tech overlays.",
    revealPending: true,
    timeline: [
      { label: "Duel announced", timestamp: subMinutes(new Date(), 200).toISOString() },
      { label: "Betting closed", timestamp: subMinutes(new Date(), 18).toISOString() },
      { label: "Reveal requested", timestamp: subMinutes(new Date(), 12).toISOString() }
    ],
    requestId: "reveal-arc-510"
  },
  "ARC-509": {
    ...DUELS[2],
    description: "Nova Archer vs Ember Lia concluded with public reveal of encrypted weights.",
    revealPending: false,
    timeline: [
      { label: "Betting closed", timestamp: subMinutes(new Date(), 320).toISOString() },
      { label: "Reveal completed", timestamp: subMinutes(new Date(), 290).toISOString() },
      { label: "Prizes claimed", timestamp: subMinutes(new Date(), 260).toISOString() }
    ],
    revealedA: 3240,
    revealedB: 2876,
    revealRatio: 3240 / (3240 + 2876),
    requestId: "reveal-arc-509"
  }
};

const POSITIONS: BetPosition[] = [
  {
    duelId: "ARC-511",
    supportedFighter: BASE_FIGHTERS[0].id,
    weight: 520,
    claimed: false,
    refundable: false,
    cipherHandle: "0xarc511-0a"
  },
  {
    duelId: "ARC-510",
    supportedFighter: BASE_FIGHTERS[2].id,
    weight: 380,
    claimed: false,
    refundable: false,
    cipherHandle: "0xarc510-92"
  },
  {
    duelId: "ARC-508",
    supportedFighter: BASE_FIGHTERS[1].id,
    weight: 450,
    claimed: true,
    refundable: false,
    cipherHandle: "0xarc508-19"
  }
];

const REVEALS: RevealJob[] = [
  {
    duelId: "ARC-510",
    requestId: "reveal-arc-510",
    status: "Pending",
    createdAt: subMinutes(new Date(), 12).toISOString()
  }
];

const useBannerStore = create<{
  banner?: TransactionBanner;
  setBanner: (banner?: TransactionBanner) => void;
}>((set) => ({
  banner: undefined,
  setBanner: (banner) => set({ banner })
}));

export function useArenaRole() {
  const role = useArenaStore((state) => state.role);
  const setRole = useArenaStore((state) => state.setRole);
  const filters = useArenaStore((state) => state.filters);
  const setFilters = useArenaStore((state) => state.setFilters);
  const selectedDuelId = useArenaStore((state) => state.selectedDuelId);
  const setSelectedDuelId = useArenaStore((state) => state.setSelectedDuelId);
  return { role, setRole, filters, setFilters, selectedDuelId, setSelectedDuelId };
}

export function useArenaHall() {
  const { filters } = useArenaRole();
  return useQuery({
    queryKey: ["arena", "duels", filters],
    queryFn: async () =>
      new Promise<DuelSummary[]>((resolve) => {
        setTimeout(() => {
          const filtered = DUELS.filter((duel) => {
            const statusMatch = filters.status === "All" ? true : duel.status === filters.status;
            const priceMatch =
              filters.minStake === "all"
                ? true
                : filters.minStake === "low"
                  ? duel.stake <= 0.02
                  : filters.minStake === "mid"
                    ? duel.stake > 0.02 && duel.stake <= 0.05
                    : duel.stake > 0.05;
            return statusMatch && priceMatch;
          });
          resolve(filtered);
        }, 120);
      }),
    refetchInterval: 5_000
  });
}

export function useDuelDetail(duelId?: string) {
  return useQuery({
    queryKey: ["arena", "duel-detail", duelId],
    queryFn: async () =>
      new Promise<DuelDetail>((resolve, reject) => {
        setTimeout(() => {
          if (!duelId) {
            reject(new Error("Missing duel id"));
            return;
          }
          const detail = DETAILS[duelId];
          detail ? resolve(detail) : reject(new Error("Duel not found"));
        }, 140);
      }),
    enabled: Boolean(duelId),
    refetchInterval: 5_000
  });
}

export function useBetPositions() {
  return useQuery({
    queryKey: ["arena", "positions"],
    queryFn: async () =>
      new Promise<BetPosition[]>((resolve) => {
        setTimeout(() => resolve(POSITIONS), 160);
      }),
    refetchInterval: 5_000
  });
}

export function useRevealJobs() {
  return useQuery({
    queryKey: ["arena", "reveal-jobs"],
    queryFn: async () =>
      new Promise<RevealJob[]>((resolve) => {
        setTimeout(() => resolve(REVEALS), 180);
      }),
    refetchInterval: 5_000
  });
}

export function formatCountdown(seconds: number) {
  if (seconds <= 0) return "Closed";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function friendlyTime(value: string) {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function fighterGradient(color: string) {
  const fallback = color === "#7027E0" ? "#ff4553" : "#2BF4FF";
  return `linear-gradient(135deg, ${color} 0%, ${fallback} 100%)`;
}

export function useBanner() {
  const banner = useBannerStore((state) => state.banner);
  const setBanner = useBannerStore((state) => state.setBanner);
  return { banner, setBanner };
}

export function useArenaActions(duelId: string) {
  const queryClient = useQueryClient();
  const { setBanner } = useBanner();

  const placeBet = useMutation({
    mutationFn: async (payload: {
      fighterId: string;
      weight: number;
      handle: string;
      proof: string;
      encryptedAt: number;
    }) => {
      setBanner({ type: "pending", message: "Generating encrypted bet handle..." });
      await new Promise((resolve) => setTimeout(resolve, 950));
      return payload;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["arena", "positions"] });
      queryClient.invalidateQueries({ queryKey: ["arena", "duel-detail", duelId] });
      setBanner({
        type: "success",
        message: `Encrypted wager for ${data.fighterId} submitted.`,
        txHash: `0xarena...${Math.random().toString(16).slice(2, 10)}`
      });
    },
    onError: () => setBanner({ type: "error", message: "Bet submission failed. Verify proof and try again." })
  });

  const requestReveal = useMutation({
    mutationFn: async () => {
      setBanner({ type: "pending", message: "Requesting encrypted total weight reveal..." });
      await new Promise((resolve) => setTimeout(resolve, 880));
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arena", "duel-detail", duelId] });
      queryClient.invalidateQueries({ queryKey: ["arena", "reveal-jobs"] });
      setBanner({
        type: "success",
        message: "Reveal request recorded. Watch for aggregated weights.",
        txHash: `0xreveal...${Math.random().toString(16).slice(2, 10)}`
      });
    },
    onError: () => setBanner({ type: "error", message: "Reveal request failed. Duel may still be open." })
  });

  const cancelDuel = useMutation({
    mutationFn: async () => {
      setBanner({ type: "pending", message: "Cancelling duel. Refund option will unlock." });
      await new Promise((resolve) => setTimeout(resolve, 820));
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arena", "duel-detail", duelId] });
      queryClient.invalidateQueries({ queryKey: ["arena", "positions"] });
      setBanner({
        type: "success",
        message: "Duel cancelled. Supporters can claim refunds.",
        txHash: `0xcancel...${Math.random().toString(16).slice(2, 10)}`
      });
    },
    onError: () => setBanner({ type: "error", message: "Cancellation failed. Try again later." })
  });

  const claimPrize = useMutation({
    mutationFn: async () => {
      setBanner({ type: "pending", message: "Claiming encrypted prize..." });
      await new Promise((resolve) => setTimeout(resolve, 780));
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arena", "positions"] });
      setBanner({
        type: "success",
        message: "Prize claim submitted. Await on-chain execution.",
        txHash: `0xclaim...${Math.random().toString(16).slice(2, 10)}`
      });
    },
    onError: () => setBanner({ type: "error", message: "Prize claim failed. Verify eligibility." })
  });

  const claimRefund = useMutation({
    mutationFn: async () => {
      setBanner({ type: "pending", message: "Requesting refund..." });
      await new Promise((resolve) => setTimeout(resolve, 760));
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arena", "positions"] });
      setBanner({
        type: "success",
        message: "Refund request accepted.",
        txHash: `0xrefund...${Math.random().toString(16).slice(2, 10)}`
      });
    },
    onError: () => setBanner({ type: "error", message: "Refund request failed." })
  });

  return { placeBet, requestReveal, cancelDuel, claimPrize, claimRefund };
}

export function isOrganizer(role: ArenaRole) {
  return role === "organizer";
}
