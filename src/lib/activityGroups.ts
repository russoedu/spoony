import type { Activity, ActivityType } from '@/types';

// Activity sections shown in the configurator and daily log, in display order:
//   wake-up spoons (single, fixed) -> scale -> activities (takes/gives) -> notes
export type GroupId = 'wakeup' | 'scale' | 'activity' | 'note';

export const GROUP_ORDER: GroupId[] = ['wakeup', 'scale', 'activity', 'note'];

export function groupOfType(type: ActivityType): GroupId {
  switch (type) {
    case 'wakeup':
      return 'wakeup';
    case 'numeric':
      return 'scale';
    case 'note':
      return 'note';
    case 'takes':
    case 'gives':
      return 'activity';
  }
}

/** Default activity type created by a group's "add" button. */
export function defaultTypeForGroup(group: Exclude<GroupId, 'wakeup'>): ActivityType {
  switch (group) {
    case 'scale':
      return 'numeric';
    case 'activity':
      return 'takes';
    case 'note':
      return 'note';
  }
}

export interface GroupedActivities {
  wakeup?: Activity;
  scale: Activity[];
  activity: Activity[];
  note: Activity[];
}

export function groupActivities(activities: Activity[]): GroupedActivities {
  const sorted = [...activities].sort((a, b) => a.order - b.order);
  return {
    wakeup: sorted.find((a) => a.type === 'wakeup'),
    scale: sorted.filter((a) => groupOfType(a.type) === 'scale'),
    activity: sorted.filter((a) => groupOfType(a.type) === 'activity'),
    note: sorted.filter((a) => groupOfType(a.type) === 'note'),
  };
}

/**
 * Renumber `order` so groups stay contiguous and in section order, preserving
 * each item's relative position within its group. Run after any structural change.
 */
export function normalizeActivities(activities: Activity[]): Activity[] {
  const rank = (a: Activity) => GROUP_ORDER.indexOf(groupOfType(a.type));
  return [...activities]
    .sort((a, b) => rank(a) - rank(b) || a.order - b.order)
    .map((a, i) => ({ ...a, order: i }));
}
