import { create } from "zustand";

import type { ArenaRole, DuelStatus } from "@/types";

interface ArenaState {
  role: ArenaRole;
  filters: {
    status: DuelStatus | "All";
    minStake: "all" | "low" | "mid" | "high";
  };
  selectedDuelId?: string;
  setRole: (role: ArenaRole) => void;
  setFilters: (partial: Partial<ArenaState["filters"]>) => void;
  setSelectedDuelId: (duelId: string) => void;
}

export const useArenaStore = create<ArenaState>((set) => ({
  role: "supporter",
  filters: {
    status: "All",
    minStake: "all"
  },
  selectedDuelId: undefined,
  setRole: (role) => set({ role }),
  setFilters: (partial) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...partial
      }
    })),
  setSelectedDuelId: (duelId) => set({ selectedDuelId: duelId })
}));



