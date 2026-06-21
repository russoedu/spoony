import type { Activity, AppConfig, DayEntry, DayValue } from '@/types';
import { SCHEMA_VERSION } from '@/data/defaultActivities';

export function todayISO(): string {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

export function dateToISO(date: Date): string {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
}

/** Builds a fresh day pre-filled with each activity's configured defaults. */
export function createEmptyDay(config: AppConfig, date: string): DayEntry {
  const values: Record<string, DayValue> = {};
  for (const activity of config.activities) {
    if (!activity.enabled) continue;
    values[activity.id] = defaultValueFor(activity);
  }
  return {
    date,
    values,
    otherActivities: [],
    schemaVersion: SCHEMA_VERSION,
    updatedAt: Date.now(),
  };
}

function defaultValueFor(activity: Activity): DayValue {
  switch (activity.type) {
    case 'takes':
    case 'gives':
    case 'wakeup':
      return { estimated: activity.defaultEstimated, used: activity.defaultUsed };
    case 'numeric':
      return { value: undefined };
    case 'note':
      return { text: '' };
  }
}

/** Ensures a loaded day has entries for every currently-enabled activity. */
export function reconcileDay(day: DayEntry, config: AppConfig): DayEntry {
  const values = { ...day.values };
  let changed = false;
  for (const activity of config.activities) {
    if (activity.enabled && !(activity.id in values)) {
      values[activity.id] = defaultValueFor(activity);
      changed = true;
    }
  }
  return changed ? { ...day, values } : day;
}
