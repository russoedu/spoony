import type { AppConfig, DayEntry } from '@/types';
import { getConfigLocal, getDayLocal, listDayDatesLocal } from '@/lib/storage/db';
import { downloadBlob } from '@/lib/downloadBlob';

/** Gathers all locally-cached data into a single decrypted JSON export. */
export async function buildExport(): Promise<{ config: AppConfig | null; days: DayEntry[] }> {
  const config = (await getConfigLocal()) ?? null;
  const dates = await listDayDatesLocal();
  const days: DayEntry[] = [];
  for (const date of dates) {
    const day = await getDayLocal(date);
    if (day) days.push(day);
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  return { config, days };
}

export async function downloadExport(): Promise<void> {
  const data = await buildExport();
  const blob = new Blob([JSON.stringify({ app: 'spoony', exportedAt: new Date().toISOString(), ...data }, null, 2)], {
    type: 'application/json',
  });
  downloadBlob(blob, `spoony-export-${new Date().toISOString().slice(0, 10)}.json`);
}
