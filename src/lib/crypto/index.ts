// Encryption layer for Spoony. Account-based model: a single random AES-GCM
// key is generated once and stored (base64) in the Drive appDataFolder. All
// day/config payloads are encrypted with it before upload.
//
// The interface is intentionally small so a future passphrase / zero-knowledge
// mode can replace key sourcing without touching callers.

export interface EncryptedPayload {
  v: 1;
  iv: string; // base64 96-bit nonce
  data: string; // base64 ciphertext (includes GCM tag)
}

const ALGO = 'AES-GCM';

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
}

/** Generate a new random 256-bit AES-GCM key, exported as raw base64. */
export async function generateKeyBase64(): Promise<string> {
  const key = await crypto.subtle.generateKey({ name: ALGO, length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
  const raw = await crypto.subtle.exportKey('raw', key);
  return toBase64(raw);
}

export async function importKey(keyBase64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', fromBase64(keyBase64) as BufferSource, { name: ALGO }, false, [
    'encrypt',
    'decrypt',
  ]);
}

export async function encryptJSON(key: CryptoKey, value: unknown): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(value));
  const cipher = await crypto.subtle.encrypt(
    { name: ALGO, iv: iv as BufferSource },
    key,
    plaintext as BufferSource
  );
  return { v: 1, iv: toBase64(iv), data: toBase64(cipher) };
}

export async function decryptJSON<T>(key: CryptoKey, payload: EncryptedPayload): Promise<T> {
  const iv = fromBase64(payload.iv);
  const cipher = fromBase64(payload.data);
  const plain = await crypto.subtle.decrypt(
    { name: ALGO, iv: iv as BufferSource },
    key,
    cipher as BufferSource
  );
  return JSON.parse(new TextDecoder().decode(plain)) as T;
}
