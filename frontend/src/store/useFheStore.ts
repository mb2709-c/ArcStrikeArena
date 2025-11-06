import { create } from "zustand";

interface FheState {
  ready: boolean;
  initializing: boolean;
  error?: string;
  setReady: (ready: boolean) => void;
  setInitializing: (value: boolean) => void;
  setError: (error?: string) => void;
}

export const useFheStore = create<FheState>((set) => ({
  ready: false,
  initializing: false,
  error: undefined,
  setReady: (ready) => set({ ready }),
  setInitializing: (initializing) => set({ initializing }),
  setError: (error) => set({ error })
}));
