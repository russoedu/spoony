import type { Activity, AppConfig, CountedValue, DayEntry, NumericValue, NoteValue, SpoonBalance } from '@/types';
import { computeBalance } from '@/lib/spoons';
import { activityLabel } from '@/providers/i18n';

export interface CountedSummaryItem {
  kind: 'counted';
  label: string;
  type: 'takes' | 'gives';
  estimated?: number;
  used?: number;
}

export interface NumericSummaryItem {
  kind: 'numeric';
  label: string;
  value?: number;
  max: number;
}

export interface NoteSummaryItem {
  kind: 'note';
  label: string;
  text: string;
}

export type SummaryItem = CountedSummaryItem | NumericSummaryItem | NoteSummaryItem;

export interface DailySummary {
  isoDate: string;
  dateLabel: string;
  wakeTime?: string;
  balance: SpoonBalance;
  items: (CountedSummaryItem | NumericSummaryItem)[];
  notes: NoteSummaryItem[];
}

type Translate = (key: string, opts?: Record<string, unknown>) => string;

/** Normalizes one day's data into a flat, format-agnostic shape shared by the image, CSV and text exports. */
export function buildDailySummary(
  day: DayEntry,
  config: AppConfig,
  t: Translate,
  dateLabel: string
): DailySummary {
  const activities = config.activities
    .filter((a) => a.enabled && a.type !== 'wakeup')
    .sort((a, b) => a.order - b.order);

  const items: (CountedSummaryItem | NumericSummaryItem)[] = activities
    .filter((a) => a.type !== 'note')
    .map((a) => toSummaryItem(a, day, t));

  const otherItems: CountedSummaryItem[] = day.otherActivities.map((o) => ({
    kind: 'counted',
    label: o.label || t('dailyLog.otherActivities'),
    type: o.type,
    estimated: o.estimated,
    used: o.used,
  }));

  const notes: NoteSummaryItem[] = config.activities
    .filter((a) => a.enabled && a.type === 'note')
    .sort((a, b) => a.order - b.order)
    .map((a): NoteSummaryItem => ({
      kind: 'note',
      label: activityLabel(t, a.id, a.label),
      text: ((day.values[a.id] as NoteValue | undefined)?.text ?? '').trim(),
    }))
    .filter((n) => n.text.length > 0);

  return {
    isoDate: day.date,
    dateLabel,
    wakeTime: day.wakeTime,
    balance: computeBalance(day, config.activities),
    items: [...items, ...otherItems],
    notes,
  };
}

function toSummaryItem(
  activity: Activity,
  day: DayEntry,
  t: Translate
): CountedSummaryItem | NumericSummaryItem {
  const label = activityLabel(t, activity.id, activity.label);
  if (activity.type === 'numeric') {
    const value = (day.values[activity.id] as NumericValue | undefined)?.value;
    return { kind: 'numeric', label, value, max: activity.numericMax ?? 10 };
  }
  const value = (day.values[activity.id] as CountedValue | undefined) ?? {};
  return {
    kind: 'counted',
    label,
    type: activity.type === 'gives' ? 'gives' : 'takes',
    estimated: value.estimated,
    used: value.used,
  };
}
