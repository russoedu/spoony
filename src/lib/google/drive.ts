import { ensureAccessToken } from './gis-auth';

// Minimal Google Drive client scoped to the hidden appDataFolder. Stores one
// JSON file per logical name (`config.json`, `key.json`, `day-YYYY-MM-DD.json`).

const FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

async function authHeaders(): Promise<HeadersInit> {
  const token = await ensureAccessToken();
  return { Authorization: `Bearer ${token}` };
}

interface DriveFile {
  id: string;
  name: string;
}

export async function listAppDataFiles(): Promise<DriveFile[]> {
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    fields: 'files(id,name)',
    pageSize: '1000',
  });
  const resp = await fetch(`${FILES_URL}?${params}`, { headers: await authHeaders() });
  if (!resp.ok) throw new Error(`Drive list failed: ${resp.status}`);
  const data = (await resp.json()) as { files?: DriveFile[] };
  return data.files ?? [];
}

export async function findFileId(name: string): Promise<string | undefined> {
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    q: `name = '${name}'`,
    fields: 'files(id,name)',
  });
  const resp = await fetch(`${FILES_URL}?${params}`, { headers: await authHeaders() });
  if (!resp.ok) throw new Error(`Drive find failed: ${resp.status}`);
  const data = (await resp.json()) as { files?: DriveFile[] };
  return data.files?.[0]?.id;
}

function multipartBody(metadata: object, content: unknown, boundary: string): string {
  return (
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    `${JSON.stringify(content)}\r\n` +
    `--${boundary}--`
  );
}

/** Create a new appDataFolder file; returns its id. */
export async function createFile(name: string, content: unknown): Promise<string> {
  const boundary = `spoony${Math.random().toString(36).slice(2)}`;
  const resp = await fetch(`${UPLOAD_URL}?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: {
      ...(await authHeaders()),
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody({ name, parents: ['appDataFolder'] }, content, boundary),
  });
  if (!resp.ok) throw new Error(`Drive create failed: ${resp.status}`);
  return ((await resp.json()) as { id: string }).id;
}

export async function updateFile(id: string, content: unknown): Promise<void> {
  const resp = await fetch(`${UPLOAD_URL}/${id}?uploadType=media`, {
    method: 'PATCH',
    headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  });
  if (!resp.ok) throw new Error(`Drive update failed: ${resp.status}`);
}

export async function downloadFile<T>(id: string): Promise<T> {
  const resp = await fetch(`${FILES_URL}/${id}?alt=media`, { headers: await authHeaders() });
  if (!resp.ok) throw new Error(`Drive download failed: ${resp.status}`);
  return (await resp.json()) as T;
}

export async function deleteFile(id: string): Promise<void> {
  const resp = await fetch(`${FILES_URL}/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!resp.ok && resp.status !== 404) throw new Error(`Drive delete failed: ${resp.status}`);
}
