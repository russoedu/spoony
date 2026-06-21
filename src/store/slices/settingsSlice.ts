import type { StateCreator } from 'zustand';
import type { ThemePreference } from '@/types';
import i18n from '@/providers/i18n';
import type { StoreState } from '../types';
import { commitConfig } from './configSlice';

export interface SettingsSlice {
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: string) => void;
}

export const createSettingsSlice: StateCreator<StoreState, [], [], SettingsSlice> = (
  set,
  get,
) => ({
  setTheme(theme) {
    const config = get().config;
    if (!config) return;
    commitConfig(set, get, { ...config, settings: { ...config.settings, theme } });
  },

  setLanguage(language) {
    const config = get().config;
    void i18n.changeLanguage(language);
    // An explicit choice must win over the browser language on future loads.
    // i18next's detector reads localStorage (key `spoony.lang`) before navigator.
    try {
      localStorage.setItem('spoony.lang', language);
    } catch {
      // ignore storage failures (e.g. private mode)
    }
    if (!config) return;
    commitConfig(set, get, { ...config, settings: { ...config.settings, language } });
  },
});
