import type { Activity } from '@/types';

/**
 * Default activity list, derived from the user's paper sheet / spreadsheet.
 * Labels are NOT stored here — they resolve from i18n key `activity.<id>` so they
 * follow the selected language. Only user-customised labels live in config.
 *
 * Order: wakeup spoons -> numeric (pain) -> takes -> gives -> notes.
 * ("Other activities" is rendered dynamically after counted rows, before notes.)
 */
export const SCHEMA_VERSION = 1;

type Seed = Omit<Activity, 'order' | 'enabled' | 'builtIn'>;

const seeds: Seed[] = [
  { id: 'spoons', type: 'wakeup' },
  { id: 'pain', type: 'numeric', numericMax: 10 },

  // Takes spoons (negative)
  { id: 'getOutOfBed', type: 'takes' },
  { id: 'toilet', type: 'takes', defaultEstimated: 1, defaultUsed: 1 },
  { id: 'getReady', type: 'takes', defaultEstimated: 1, defaultUsed: 1 },
  { id: 'eat', type: 'takes', defaultEstimated: 1, defaultUsed: 1 },
  { id: 'shower', type: 'takes' },
  { id: 'cook', type: 'takes' },
  { id: 'clean', type: 'takes' },
  { id: 'physiotherapy', type: 'takes' },

  // Gives spoons (positive)
  { id: 'exercise', type: 'gives' },
  { id: 'relax', type: 'gives' },
  { id: 'activities', type: 'gives' },
  { id: 'therapy', type: 'gives' },
  { id: 'journal', type: 'gives' },
  { id: 'hyperfocus', type: 'gives' },

  // Notes — "how did I feel"
  { id: 'wokeUpFeel', type: 'note' },
  { id: 'slept', type: 'note' },
  { id: 'plan', type: 'note' },
  { id: 'need', type: 'note' },
  { id: 'want', type: 'note' },
];

export function createDefaultActivities(): Activity[] {
  return seeds.map((seed, index) => ({
    ...seed,
    order: index,
    enabled: true,
    builtIn: true,
  }));
}
