import type { StateCreator } from 'zustand';
import type { AppConfig } from '@/types';
import { createDefaultActivities, SCHEMA_VERSION } from '@/data/defaultActivities';
import * as sync from '@/lib/storage/sync';
import * as db from '@/lib/storage/db';
import { todayISO } from '@/lib/day';
import i18n, { SUPPORTED_LANGUAGES } from '@/providers/i18n';
import type { StoreState } from '../types';

export interface ConfigSlice {
  config: AppConfig | null;
  ready: boolean;
  /** True right after a brand-new config is created (first ever sign-in). */
  firstRun: boolean;
  clearFirstRun: () => void;
}

let configTimer: ReturnType<typeof setTimeout> | null = null;

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

function applyLanguage(language: string) {
  if (language && i18n.language !== language) void i18n.changeLanguage(language);
}

export function scheduleConfigSave(get: () => StoreState) {
  if (configTimer) clearTimeout(configTimer);
  configTimer = setTimeout(async () => {
    const config = get().config;
    if (config) await sync.saveConfig(config);
  }, 500);
}

export function commitConfig(
  set: (partial: Partial<StoreState>) => void,
  get: () => StoreState,
  config: AppConfig,
) {
  set({ config });
  scheduleConfigSave(get);
}

export async function initData(
  set: (partial: Partial<StoreState>) => void,
  get: () => StoreState,
) {
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

export const createConfigSlice: StateCreator<StoreState, [], [], ConfigSlice> = (set) => ({
  config: null,
  ready: false,
  firstRun: false,
  clearFirstRun: () => set({ firstRun: false }),
});
