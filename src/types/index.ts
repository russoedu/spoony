// Core domain types for Spoony.

/**
 * Activity field types.
 * - `wakeup`  : the number of spoons you woke up with (starting budget).
 * - `takes`   : a counted activity that consumes spoons (negative).
 * - `gives`   : a counted activity that restores spoons (positive).
 * - `numeric` : a 0..max rating recorded only (e.g. pain 0-10); no spoon effect in v1.
 * - `note`    : a free multiline text field.
 */
export type ActivityType = 'wakeup' | 'takes' | 'gives' | 'numeric' | 'note';

export interface Activity {
  id: string;
  type: ActivityType;
  /** User override label. When absent, the default i18n key `activity.<id>` is used. */
  label?: string;
  /** Counted types: default estimated quantity pre-filled on a new day. */
  defaultEstimated?: number;
  /** Counted types: default used quantity pre-filled on a new day. */
  defaultUsed?: number;
  /** Numeric type: inclusive maximum of the scale (e.g. 10 for pain). */
  numericMax?: number;
  order: number;
  enabled: boolean;
  /** True for built-in defaults; false for user-created activities. */
  builtIn: boolean;
}

export type ThemePreference = 'light' | 'dark' | 'system';

export interface Settings {
  language: string; // BCP-47, e.g. 'en' | 'pt'
  theme: ThemePreference;
}

export interface AppConfig {
  activities: Activity[];
  settings: Settings;
  schemaVersion: number;
}

/** Per-activity recorded value on a given day; shape depends on the activity type. */
export type CountedValue = { estimated?: number; used?: number };
export type NumericValue = { value?: number };
export type NoteValue = { text?: string };
export type DayValue = CountedValue | NumericValue | NoteValue;

export interface OtherActivity {
  id: string;
  label: string;
  type: 'takes' | 'gives';
  estimated?: number;
  used?: number;
}

export interface DayEntry {
  date: string; // 'YYYY-MM-DD'
  wakeTime?: string; // free text / HH:mm
  values: Record<string, DayValue>;
  otherActivities: OtherActivity[];
  schemaVersion: number;
  /** Last local modification, ms epoch — used for last-write-wins sync. */
  updatedAt: number;
}

export interface SpoonBalance {
  wakeup: number;
  plannedBalance: number;
  usedBalance: number;
}
