import { create } from 'zustand';
import type { Activity, AppConfig, DayEntry, DayValue, ThemePreference } from '@/types';
import { createDefaultActivities, SCHEMA_VERSION } from '@/data/defaultActivities';
import {
  ensureAccessToken,
  fetchUserInfo,
  requestAccessToken,
  revokeToken,
  type GoogleUser,
} from '@/lib/google/gis-auth';
import * as sync from '@/lib/storage/sync';
import * as db from '@/lib/storage/db';
import { createEmptyDay, reconcileDay, todayISO } from '@/lib/day';
import {
  defaultTypeForGroup,
  normalizeActivities,
  type GroupId,
} from '@/lib/activityGroups';
import i18n, { SUPPORTED_LANGUAGES } from '@/providers/i18n';

type AddableGroup = Exclude<GroupId, 'wakeup'>;

export type AuthStatus = 'idle' | 'restoring' | 'connecting' | 'authed' | 'error';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline';

interface StoreState {
  authStatus: AuthStatus;
  user: GoogleUser | null;
  authError: string | null;

  config: AppConfig | null;
  ready: boolean;
  /** True right after a brand-new config is created (first ever sign-in). */
  firstRun: boolean;
  clearFirstRun: () => void;

  currentDate: string;
  currentDay: DayEntry | null;
  saveStatus: SaveStatus;
  online: boolean;

  signIn: () => Promise<void>;
  restoreSession: () => Promise<void>;
  signOut: () => void;
  deleteAllData: () => Promise<void>;

  setDate: (date: string) => Promise<void>;
  updateDay: (mutate: (draft: DayEntry) => void) => void;

  setActivities: (activities: Activity[]) => void;
  addActivity: (group: AddableGroup) => void;
  updateActivity: (id: string, patch: Partial<Activity>) => void;
  removeActivity: (id: string) => void;
  cycleActivityType: (id: string) => void;
  restoreDefaultActivities: () => void;
  /** Count of built-in defaults that have been removed (for the restore button). */
  missingDefaultsCount: () => number;

  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: string) => void;

  setOnline: (online: boolean) => void;
}

/** The browser-detected language, narrowed to a supported one (e.g. pt-BR -> pt). */
function resolveLanguage(): string {
  const base = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(base) ? base : 'en';
}

function createDefaultConfig(): AppConfig {
  return {
    activities: createDefaultActivities(),
    settings: { language: resolveLanguage(), theme: 'system' },
    schemaVersion: SCHEMA_VERSION,
  };
}

const CONNECTED_FLAG = 'spoony.connected';

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let configTimer: ReturnType<typeof setTimeout> | null = null;

export const useStore = create<StoreState>((set, get) => {
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

  function scheduleConfigSave() {
    if (configTimer) clearTimeout(configTimer);
    configTimer = setTimeout(async () => {
      const config = get().config;
      if (config) await sync.saveConfig(config);
    }, 500);
  }

  function commitConfig(config: AppConfig) {
    set({ config });
    scheduleConfigSave();
  }

  async function initData() {
    await sync.bootstrapKey();
    let config = await sync.loadConfigFromDrive();
    if (!config) config = (await db.getConfigLocal()) ?? null;
    let firstRun = false;
    if (!config) {
      config = createDefaultConfig();
      await sync.saveConfig(config);
      firstRun = true; // brand-new user — send them to the activities editor
    }
    set({ config, firstRun });
    applyLanguage(config.settings.language);
    set({ ready: true });
    await get().setDate(todayISO());
    void sync.syncPending(() => get().config);
  }

  function applyLanguage(language: string) {
    if (language && i18n.language !== language) void i18n.changeLanguage(language);
  }

  return {
    authStatus: 'idle',
    user: null,
    authError: null,
    config: null,
    ready: false,
    firstRun: false,
    clearFirstRun: () => set({ firstRun: false }),
    currentDate: todayISO(),
    currentDay: null,
    saveStatus: 'idle',
    online: navigator.onLine,

    async signIn() {
      set({ authStatus: 'connecting', authError: null });
      try {
        const token = await requestAccessToken(true);
        const user = await fetchUserInfo(token);
        localStorage.setItem(CONNECTED_FLAG, '1');
        set({ user, authStatus: 'authed' });
        await initData();
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
        await initData();
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

    setActivities(activities) {
      const config = get().config;
      if (!config) return;
      // Take the caller's array order as the new order, then keep groups contiguous.
      const withOrder = activities.map((a, i) => ({ ...a, order: i }));
      commitConfig({ ...config, activities: normalizeActivities(withOrder) });
    },

    addActivity(group) {
      const config = get().config;
      if (!config) return;
      const type = defaultTypeForGroup(group as AddableGroup);
      const activity: Activity = {
        id: `custom-${Date.now().toString(36)}`,
        type,
        label: '',
        order: config.activities.length,
        enabled: true,
        builtIn: false,
        ...(type === 'numeric' ? { numericMax: 10 } : {}),
      };
      commitConfig({ ...config, activities: normalizeActivities([...config.activities, activity]) });
    },

    updateActivity(id, patch) {
      const config = get().config;
      if (!config) return;
      commitConfig({
        ...config,
        activities: config.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      });
    },

    removeActivity(id) {
      const config = get().config;
      if (!config) return;
      commitConfig({
        ...config,
        activities: normalizeActivities(config.activities.filter((a) => a.id !== id)),
      });
    },

    // Within the "activities" group the icon toggles takes <-> gives only.
    // Scale and note items have a fixed type.
    cycleActivityType(id) {
      const config = get().config;
      if (!config) return;
      commitConfig({
        ...config,
        activities: config.activities.map((a) => {
          if (a.id !== id) return a;
          if (a.type === 'takes') return { ...a, type: 'gives' };
          if (a.type === 'gives') return { ...a, type: 'takes' };
          return a;
        }),
      });
    },

    restoreDefaultActivities() {
      const config = get().config;
      if (!config) return;
      const existing = new Set(config.activities.map((a) => a.id));
      const missing = createDefaultActivities().filter((a) => !existing.has(a.id));
      if (missing.length === 0) return;
      commitConfig({
        ...config,
        activities: normalizeActivities([...config.activities, ...missing]),
      });
    },

    missingDefaultsCount() {
      const config = get().config;
      if (!config) return 0;
      const existing = new Set(config.activities.map((a) => a.id));
      return createDefaultActivities().filter((a) => !existing.has(a.id)).length;
    },

    setTheme(theme) {
      const config = get().config;
      if (!config) return;
      commitConfig({ ...config, settings: { ...config.settings, theme } });
    },

    setLanguage(language) {
      const config = get().config;
      void i18n.changeLanguage(language);
      if (!config) return;
      commitConfig({ ...config, settings: { ...config.settings, language } });
    },

    setOnline(online) {
      set({ online });
      if (online && get().ready) {
        void sync.syncPending(() => get().config).then((ok) => {
          if (ok && get().saveStatus === 'offline') set({ saveStatus: 'saved' });
        });
      }
    },
  };
});

// Re-export for convenience in day-value updates.
export type { DayValue };
