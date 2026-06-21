import { describe, expect, it } from 'vitest';
import { decryptJSON, encryptJSON, generateKeyBase64, importKey } from './index';

describe('crypto round-trip', () => {
  it('encrypts and decrypts a JSON value', async () => {
    const key = await importKey(await generateKeyBase64());
    const value = { date: '2026-06-21', values: { spoons: { used: 10 } } };
    const payload = await encryptJSON(key, value);
    expect(payload.v).toBe(1);
    expect(payload.data).not.toContain('spoons');
    const decrypted = await decryptJSON<typeof value>(key, payload);
    expect(decrypted).toEqual(value);
  });

  it('fails to decrypt with the wrong key', async () => {
    const k1 = await importKey(await generateKeyBase64());
    const k2 = await importKey(await generateKeyBase64());
    const payload = await encryptJSON(k1, { secret: 42 });
    await expect(decryptJSON(k2, payload)).rejects.toBeDefined();
  });
});
