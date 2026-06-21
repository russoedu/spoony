import type { StateCreator } from 'zustand';
import * as sync from '@/lib/storage/sync';
import type { StoreState } from '../types';

export interface OnlineSlice {
  online: boolean;
  setOnline: (online: boolean) => void;
}

export const createOnlineSlice: StateCreator<StoreState, [], [], OnlineSlice> = (set, get) => ({
  online: navigator.onLine,

  setOnline(online) {
    set({ online });
    if (online && get().ready) {
      void sync.syncPending(() => get().config).then((ok) => {
        if (ok && get().saveStatus === 'offline') set({ saveStatus: 'saved' });
      });
    }
  },
});
