import type { StateCreator } from 'zustand';
import type { Activity } from '@/types';
import { createDefaultActivities } from '@/data/defaultActivities';
import { defaultTypeForGroup, normalizeActivities, type GroupId } from '@/lib/activityGroups';
import type { StoreState } from '../types';
import { commitConfig } from './configSlice';

type AddableGroup = Exclude<GroupId, 'wakeup'>;

export interface ActivitiesSlice {
  setActivities: (activities: Activity[]) => void;
  addActivity: (group: AddableGroup) => void;
  updateActivity: (id: string, patch: Partial<Activity>) => void;
  removeActivity: (id: string) => void;
  cycleActivityType: (id: string) => void;
  restoreDefaultActivities: () => void;
  /** Count of built-in defaults that have been removed (for the restore button). */
  missingDefaultsCount: () => number;
}

export const createActivitiesSlice: StateCreator<StoreState, [], [], ActivitiesSlice> = (
  set,
  get,
) => ({
  setActivities(activities) {
    const config = get().config;
    if (!config) return;
    // Take the caller's array order as the new order, then keep groups contiguous.
    const withOrder = activities.map((a, i) => ({ ...a, order: i }));
    commitConfig(set, get, { ...config, activities: normalizeActivities(withOrder) });
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
    commitConfig(set, get, {
      ...config,
      activities: normalizeActivities([...config.activities, activity]),
    });
  },

  updateActivity(id, patch) {
    const config = get().config;
    if (!config) return;
    commitConfig(set, get, {
      ...config,
      activities: config.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  },

  removeActivity(id) {
    const config = get().config;
    if (!config) return;
    commitConfig(set, get, {
      ...config,
      activities: normalizeActivities(config.activities.filter((a) => a.id !== id)),
    });
  },

  // Within the "activities" group the icon toggles takes <-> gives only.
  // Scale and note items have a fixed type.
  cycleActivityType(id) {
    const config = get().config;
    if (!config) return;
    commitConfig(set, get, {
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
    commitConfig(set, get, {
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
});
