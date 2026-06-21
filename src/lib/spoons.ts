import type {
  Activity,
  CountedValue,
  DayEntry,
  NumericValue,
  SpoonBalance,
} from '@/types';

function asCounted(v: unknown): CountedValue {
  return (v ?? {}) as CountedValue;
}

/**
 * Computes the spoon balance for a day.
 *
 *   plannedBalance = wakeup - Σ(estimated takes) + Σ(estimated gives)
 *   usedBalance    = wakeup - Σ(used takes)      + Σ(used gives)
 *
 * Numeric/note activities never affect the balance. "Other activities" are
 * included as their declared takes/gives type.
 */
export function computeBalance(day: DayEntry, activities: Activity[]): SpoonBalance {
  const wakeupActivity = activities.find((a) => a.type === 'wakeup');
  const wakeup = wakeupActivity
    ? Number(asCounted(day.values[wakeupActivity.id]).used ?? 0)
    : 0;

  let plannedSpent = 0;
  let usedSpent = 0;

  for (const activity of activities) {
    if (activity.type !== 'takes' && activity.type !== 'gives') continue;
    const value = asCounted(day.values[activity.id]);
    const sign = activity.type === 'takes' ? -1 : 1;
    plannedSpent += sign * Number(value.estimated ?? 0);
    usedSpent += sign * Number(value.used ?? 0);
  }

  for (const other of day.otherActivities) {
    const sign = other.type === 'takes' ? -1 : 1;
    plannedSpent += sign * Number(other.estimated ?? 0);
    usedSpent += sign * Number(other.used ?? 0);
  }

  return {
    wakeup,
    plannedBalance: wakeup + plannedSpent,
    usedBalance: wakeup + usedSpent,
  };
}

export function getNumeric(day: DayEntry, activityId: string): number | undefined {
  return (day.values[activityId] as NumericValue | undefined)?.value;
}
