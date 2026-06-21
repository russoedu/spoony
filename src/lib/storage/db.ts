import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AppConfig, DayEntry } from '@/types';

// Drive file id cache, keyed by logical name (`config`, `key`, `day-YYYY-MM-DD`).
export type FileIdMap = Record<string, string>;

interface SpoonyDB extends DBSchema {
  days: {
    key: string; // 'YYYY-MM-DD'
    value: DayEntry;
  };
  kv: {
    key: string;
    value: unknown;
  };
}

let dbPromise: Promise<IDBPDatabase<SpoonyDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<SpoonyDB>('spoony', 1, {
      upgrade(db) {
        db.createObjectStore('days');
        db.createObjectStore('kv');
      },
    });
  }
  return dbPromise;
}

// --- Days ---------------------------------------------------------------

export async function getDayLocal(date: string): Promise<DayEntry | undefined> {
  return (await getDB()).get('days', date);
}

export async function putDayLocal(day: DayEntry): Promise<void> {
  await (await getDB()).put('days', day, day.date);
}

export async function listDayDatesLocal(): Promise<string[]> {
  return (await (await getDB()).getAllKeys('days')) as string[];
}

// --- Key/value (config, crypto key, drive file ids) ---------------------

export async function getConfigLocal(): Promise<AppConfig | undefined> {
  return (await getDB()).get('kv', 'config') as Promise<AppConfig | undefined>;
}

export async function putConfigLocal(config: AppConfig): Promise<void> {
  await (await getDB()).put('kv', config, 'config');
}

export async function getCryptoKeyLocal(): Promise<string | undefined> {
  return (await getDB()).get('kv', 'cryptoKey') as Promise<string | undefined>;
}

export async function putCryptoKeyLocal(keyBase64: string): Promise<void> {
  await (await getDB()).put('kv', keyBase64, 'cryptoKey');
}

export async function getFileIdMap(): Promise<FileIdMap> {
  return ((await (await getDB()).get('kv', 'fileIds')) as FileIdMap) ?? {};
}

export async function putFileIdMap(map: FileIdMap): Promise<void> {
  await (await getDB()).put('kv', map, 'fileIds');
}

/** Names of records that still need to be pushed to Drive. */
export async function getPendingSync(): Promise<string[]> {
  return ((await (await getDB()).get('kv', 'pendingSync')) as string[]) ?? [];
}

export async function setPendingSync(names: string[]): Promise<void> {
  await (await getDB()).put('kv', names, 'pendingSync');
}

export async function clearAllLocal(): Promise<void> {
  const db = await getDB();
  await db.clear('days');
  await db.clear('kv');
}
