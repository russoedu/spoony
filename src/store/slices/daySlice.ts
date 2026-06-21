import type { StateCreator } from 'zustand';
import type { DayEntry } from '@/types';
import * as sync from '@/lib/storage/sync';
import { createEmptyDay, reconcileDay, todayISO } from '@/lib/day';
import type { StoreState } from '../types';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline';

export interface DaySlice {
  currentDate: string;
  currentDay: DayEntry | null;
  saveStatus: SaveStatus;

  setDate: (date: string) => Promise<void>;
  updateDay: (mutate: (draft: DayEntry) => void) => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const createDaySlice: StateCreator<StoreState, [], [], DaySlice> = (set, get) => {
  function scheduleDaySave() {
    set({ saveStatus: 'saving' });
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const day = get().currentDay;
      if (!day) return;
      const ok = await sync.saveDay(day);
      set({ saveStatus: ok ? 'saved' : 'offline' });
    }, 700);
  }

  return {
    currentDate: todayISO(),
    currentDay: null,
    saveStatus: 'idle',

    async setDate(date) {
      const config = get().config;
      if (!config) return;
      set({ currentDate: date, currentDay: null });
      const loaded = await sync.loadDay(date);
      const day = loaded ? reconcileDay(loaded, config) : createEmptyDay(config, date);
      set({ currentDay: day, saveStatus: loaded ? 'saved' : 'idle' });
    },

    updateDay(mutate) {
      const day = get().currentDay;
      if (!day) return;
      const draft: DayEntry = structuredClone(day);
      mutate(draft);
      draft.updatedAt = Date.now();
      set({ currentDay: draft });
      scheduleDaySave();
    },
  };
};
