import { create } from 'zustand';
import type { StoreState } from './types';
import { createAuthSlice } from './slices/authSlice';
import { createConfigSlice } from './slices/configSlice';
import { createActivitiesSlice } from './slices/activitiesSlice';
import { createSettingsSlice } from './slices/settingsSlice';
import { createDaySlice } from './slices/daySlice';
import { createOnlineSlice } from './slices/onlineSlice';

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createConfigSlice(...a),
  ...createActivitiesSlice(...a),
  ...createSettingsSlice(...a),
  ...createDaySlice(...a),
  ...createOnlineSlice(...a),
}));

export type { AuthStatus } from './slices/authSlice';
export type { SaveStatus } from './slices/daySlice';
export type { DayValue } from '@/types';
