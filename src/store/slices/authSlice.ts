import type { StateCreator } from 'zustand';
import {
  ensureAccessToken,
  fetchUserInfo,
  requestAccessToken,
  revokeToken,
  type GoogleUser,
} from '@/lib/google/gis-auth';
import * as sync from '@/lib/storage/sync';
import * as db from '@/lib/storage/db';
import type { StoreState } from '../types';
import { initData } from './configSlice';

export type AuthStatus = 'idle' | 'restoring' | 'connecting' | 'authed' | 'error';

const CONNECTED_FLAG = 'spoony.connected';

export interface AuthSlice {
  authStatus: AuthStatus;
  user: GoogleUser | null;
  authError: string | null;

  signIn: () => Promise<void>;
  restoreSession: () => Promise<void>;
  signOut: () => void;
  deleteAllData: () => Promise<void>;
}

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set, get) => ({
  authStatus: 'idle',
  user: null,
  authError: null,

  async signIn() {
    set({ authStatus: 'connecting', authError: null });
    try {
      const token = await requestAccessToken(true);
      const user = await fetchUserInfo(token);
      localStorage.setItem(CONNECTED_FLAG, '1');
      set({ user, authStatus: 'authed' });
      await initData(set, get);
    } catch (err) {
      set({ authStatus: 'error', authError: (err as Error).message });
    }
  },

  async restoreSession() {
    // Only attempt a silent token for users who connected before, so brand-new
    // visitors never get a surprise Google popup on first load.
    if (!localStorage.getItem(CONNECTED_FLAG)) {
      set({ authStatus: 'idle' });
      return;
    }
    set({ authStatus: 'restoring' });
    try {
      const token = await ensureAccessToken();
      const user = await fetchUserInfo(token);
      set({ user, authStatus: 'authed' });
      await initData(set, get);
    } catch {
      // No silent session — show the sign-in screen.
      set({ authStatus: 'idle' });
    }
  },

  signOut() {
    revokeToken();
    sync.resetSyncState();
    localStorage.removeItem(CONNECTED_FLAG);
    set({
      authStatus: 'idle',
      user: null,
      config: null,
      ready: false,
      currentDay: null,
      saveStatus: 'idle',
    });
  },

  async deleteAllData() {
    // Wipe the hidden Drive folder (key, config, all days), then the local cache.
    try {
      await sync.deleteAllRemote();
    } catch {
      // best-effort — still clear locally and sign out
    }
    await db.clearAllLocal();
    revokeToken();
    sync.resetSyncState();
    localStorage.removeItem(CONNECTED_FLAG);
    set({
      authStatus: 'idle',
      user: null,
      config: null,
      ready: false,
      firstRun: false,
      currentDay: null,
      saveStatus: 'idle',
    });
  },
});
