import type { AuthSlice } from './slices/authSlice';
import type { ConfigSlice } from './slices/configSlice';
import type { ActivitiesSlice } from './slices/activitiesSlice';
import type { SettingsSlice } from './slices/settingsSlice';
import type { DaySlice } from './slices/daySlice';
import type { OnlineSlice } from './slices/onlineSlice';

export type StoreState = AuthSlice &
  ConfigSlice &
  ActivitiesSlice &
  SettingsSlice &
  DaySlice &
  OnlineSlice;
