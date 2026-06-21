import type { AppConfig, DayEntry } from '@/types';
import {
  decryptJSON,
  encryptJSON,
  generateKeyBase64,
  importKey,
  type EncryptedPayload,
} from '@/lib/crypto';
import * as drive from '@/lib/google/drive';
import * as db from './db';

// High-level sync: ties together crypto, the Drive appDataFolder client and the
// local IndexedDB cache. Local writes are immediate; Drive pushes can fail
// offline and are queued in `pendingSync`.

const KEY_FILE = 'key.json';
const CONFIG_FILE = 'config.json';
const dayFile = (date: string) => `day-${date}.json`;

let cryptoKey: CryptoKey | null = null;

interface KeyFile {
  key: string;
}

/** Ensure an encryption key exists (Drive is source of truth across devices). */
export async function bootstrapKey(): Promise<void> {
  // Try Drive first so a second device reuses the same key.
  let keyBase64: string | undefined;
  try {
    const id = await drive.findFileId(KEY_FILE);
    if (id) {
      keyBase64 = (await drive.downloadFile<KeyFile>(id)).key;
      await db.putFileIdMap({ ...(await db.getFileIdMap()), [KEY_FILE]: id });
    }
  } catch {
    // Offline — fall back to the locally cached key if we have one.
    keyBase64 = await db.getCryptoKeyLocal();
  }

  if (!keyBase64) {
    keyBase64 = await db.getCryptoKeyLocal();
  }

  if (!keyBase64) {
    keyBase64 = await generateKeyBase64();
    try {
      const id = await drive.createFile(KEY_FILE, { key: keyBase64 } satisfies KeyFile);
      await db.putFileIdMap({ ...(await db.getFileIdMap()), [KEY_FILE]: id });
    } catch {
      // Will be created on next successful sync.
    }
  }

  await db.putCryptoKeyLocal(keyBase64);
  cryptoKey = await importKey(keyBase64);
}

function requireKey(): CryptoKey {
  if (!cryptoKey) throw new Error('Encryption key not initialised');
  return cryptoKey;
}

async function pushEncrypted(name: string, value: unknown): Promise<void> {
  const payload = await encryptJSON(requireKey(), value);
  const map = await db.getFileIdMap();
  const existingId = map[name];
  if (existingId) {
    await drive.updateFile(existingId, payload);
  } else {
    const id = await drive.findFileId(name);
    if (id) {
      await drive.updateFile(id, payload);
      await db.putFileIdMap({ ...map, [name]: id });
    } else {
      const newId = await drive.createFile(name, payload);
      await db.putFileIdMap({ ...map, [name]: newId });
    }
  }
}

async function markPending(name: string): Promise<void> {
  const pending = await db.getPendingSync();
  if (!pending.includes(name)) await db.setPendingSync([...pending, name]);
}

async function unmarkPending(name: string): Promise<void> {
  const pending = await db.getPendingSync();
  await db.setPendingSync(pending.filter((n) => n !== name));
}

// --- Config -------------------------------------------------------------

export async function loadConfigFromDrive(): Promise<AppConfig | null> {
  try {
    const id = (await db.getFileIdMap())[CONFIG_FILE] ?? (await drive.findFileId(CONFIG_FILE));
    if (!id) return null;
    const payload = await drive.downloadFile<EncryptedPayload>(id);
    const config = await decryptJSON<AppConfig>(requireKey(), payload);
    await db.putFileIdMap({ ...(await db.getFileIdMap()), [CONFIG_FILE]: id });
    await db.putConfigLocal(config);
    return config;
  } catch {
    return null;
  }
}

export async function saveConfig(config: AppConfig): Promise<boolean> {
  await db.putConfigLocal(config);
  try {
    await pushEncrypted(CONFIG_FILE, config);
    await unmarkPending(CONFIG_FILE);
    return true;
  } catch {
    await markPending(CONFIG_FILE);
    return false;
  }
}

// --- Days ---------------------------------------------------------------

export async function loadDay(date: string): Promise<DayEntry | null> {
  const name = dayFile(date);
  try {
    const id = (await db.getFileIdMap())[name] ?? (await drive.findFileId(name));
    if (id) {
      const payload = await drive.downloadFile<EncryptedPayload>(id);
      const remote = await decryptJSON<DayEntry>(requireKey(), payload);
      const local = await db.getDayLocal(date);
      // Last-write-wins.
      const winner = local && local.updatedAt > remote.updatedAt ? local : remote;
      await db.putFileIdMap({ ...(await db.getFileIdMap()), [name]: id });
      await db.putDayLocal(winner);
      return winner;
    }
  } catch {
    // fall through to local
  }
  return (await db.getDayLocal(date)) ?? null;
}

export async function saveDay(day: DayEntry): Promise<boolean> {
  const stamped = { ...day, updatedAt: Date.now() };
  await db.putDayLocal(stamped);
  const name = dayFile(day.date);
  try {
    await pushEncrypted(name, stamped);
    await unmarkPending(name);
    return true;
  } catch {
    await markPending(name);
    return false;
  }
}

/** Push everything queued while offline. Returns true if all succeeded. */
export async function syncPending(getConfig: () => AppConfig | null): Promise<boolean> {
  const pending = await db.getPendingSync();
  let allOk = true;
  for (const name of pending) {
    try {
      if (name === CONFIG_FILE) {
        const config = getConfig() ?? (await db.getConfigLocal());
        if (config) await pushEncrypted(CONFIG_FILE, config);
      } else if (name.startsWith('day-')) {
        const date = name.slice('day-'.length, -'.json'.length);
        const day = await db.getDayLocal(date);
        if (day) await pushEncrypted(name, day);
      }
      await unmarkPending(name);
    } catch {
      allOk = false;
    }
  }
  return allOk;
}

export function resetSyncState(): void {
  cryptoKey = null;
}
