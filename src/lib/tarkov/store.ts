"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameMode } from "./types";
import { DEFAULT_PIN_IDS } from "./search";

type FleaState = {
  mode: GameMode;
  pins: string[];
  recents: string[];
  setMode: (mode: GameMode) => void;
  togglePin: (id: string) => void;
  pushRecent: (id: string) => void;
};

export const useFleaStore = create<FleaState>()(
  persist(
    (set, get) => ({
      mode: "regular",
      pins: DEFAULT_PIN_IDS,
      recents: [],
      setMode: (mode) => set({ mode }),
      togglePin: (id) => {
        const pins = get().pins;
        set({
          pins: pins.includes(id) ? pins.filter((p) => p !== id) : [id, ...pins].slice(0, 16),
        });
      },
      pushRecent: (id) => {
        const recents = get().recents.filter((r) => r !== id);
        set({ recents: [id, ...recents].slice(0, 12) });
      },
    }),
    { name: "flea-scan" },
  ),
);
