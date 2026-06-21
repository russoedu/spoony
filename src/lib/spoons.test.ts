import { describe, expect, it } from 'vitest';
import { computeBalance } from './spoons';
import { createDefaultActivities } from '@/data/defaultActivities';
import type { DayEntry } from '@/types';

const activities = createDefaultActivities();

function makeDay(values: DayEntry['values'], otherActivities: DayEntry['otherActivities'] = []): DayEntry {
  return {
    date: '2026-06-21',
    values,
    otherActivities,
    schemaVersion: 1,
    updatedAt: 0,
  };
}

describe('computeBalance', () => {
  it('returns wakeup value with no activities logged', () => {
    const day = makeDay({ spoons: { used: 12 } });
    const balance = computeBalance(day, activities);
    expect(balance.wakeup).toBe(12);
    expect(balance.usedBalance).toBe(12);
    expect(balance.plannedBalance).toBe(12);
  });

  it('subtracts takes and adds gives for used balance', () => {
    const day = makeDay({
      spoons: { used: 10 },
      toilet: { used: 1 },
      eat: { used: 2 },
      exercise: { used: 3 }, // gives
    });
    const balance = computeBalance(day, activities);
    // 10 - 1 - 2 + 3 = 10
    expect(balance.usedBalance).toBe(10);
  });

  it('uses estimated values for the planned balance', () => {
    const day = makeDay({
      spoons: { used: 8 },
      shower: { estimated: 2, used: 1 },
      relax: { estimated: 1, used: 4 }, // gives
    });
    const balance = computeBalance(day, activities);
    expect(balance.plannedBalance).toBe(8 - 2 + 1); // 7
    expect(balance.usedBalance).toBe(8 - 1 + 4); // 11
  });

  it('includes ad-hoc other activities', () => {
    const day = makeDay({ spoons: { used: 5 } }, [
      { id: 'o1', label: 'gardening', type: 'takes', used: 2, estimated: 2 },
      { id: 'o2', label: 'music', type: 'gives', used: 1, estimated: 1 },
    ]);
    const balance = computeBalance(day, activities);
    expect(balance.usedBalance).toBe(5 - 2 + 1); // 4
  });

  it('ignores numeric and note activities', () => {
    const day = makeDay({
      spoons: { used: 6 },
      pain: { value: 7 },
      wokeUpFeel: { text: 'tired' },
    });
    const balance = computeBalance(day, activities);
    expect(balance.usedBalance).toBe(6);
  });
});
