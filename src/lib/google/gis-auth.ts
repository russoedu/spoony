import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from './config';

// Loads Google Identity Services and manages OAuth access tokens (token model).
// The access token lives in memory only; we never persist a refresh token.

const GIS_SRC = 'https://accounts.google.com/gsi/client';

// The shipped @types only expose a partial TokenClient; we set the callback and
// error_callback per-request, so widen the type here.
interface MutableTokenClient extends google.accounts.oauth2.TokenClient {
  callback: (resp: google.accounts.oauth2.TokenResponse) => void;
  error_callback: (err: { type?: string }) => void;
}

let gisLoaded: Promise<void> | null = null;
let tokenClient: MutableTokenClient | null = null;

let accessToken: string | null = null;
let tokenExpiry = 0; // ms epoch

export interface GoogleUser {
  name: string;
  email: string;
  picture?: string;
}

function loadGis(): Promise<void> {
  if (gisLoaded) return gisLoaded;
  gisLoaded = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
  return gisLoaded;
}

async function getTokenClient(): Promise<MutableTokenClient> {
  await loadGis();
  if (!tokenClient) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      callback: () => {}, // replaced per-request below
    }) as MutableTokenClient;
  }
  return tokenClient;
}

/** Preload GIS + the token client so the first sign-in click opens the popup
 * within the user gesture (awaiting the script load at click time gets blocked). */
export function preloadGis(): void {
  void getTokenClient();
}

/**
 * Request an access token. `interactive` controls whether Google may show the
 * consent/account-picker UI (true on user click, false for silent refresh).
 */
export function requestAccessToken(interactive: boolean): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const run = (client: MutableTokenClient) => {
      client.callback = (resp) => {
        if (resp.error) {
          // Surface the full response (error + description) so the real cause is
          // visible in the console, and propagate a readable message to the UI.
          console.error('[gis] token error', resp);
          const detail = (resp as { error_description?: string }).error_description;
          reject(new Error(detail ? `${resp.error}: ${detail}` : resp.error));
          return;
        }
        accessToken = resp.access_token;
        // expires_in is seconds; refresh a minute early.
        tokenExpiry = Date.now() + (Number(resp.expires_in) - 60) * 1000;
        resolve(resp.access_token);
      };
      client.error_callback = (err) => {
        // e.g. popup_closed, popup_failed_to_open — the type names the cause.
        console.error('[gis] token error_callback', err);
        reject(new Error(err.type || 'oauth_error'));
      };
      client.requestAccessToken({ prompt: interactive ? 'consent' : '' });
    };
    // When already preloaded, call synchronously to preserve the click gesture.
    if (tokenClient) run(tokenClient);
    else getTokenClient().then(run).catch(reject);
  });
}

/** Returns a valid access token, refreshing silently if needed. */
export async function ensureAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;
  return requestAccessToken(false);
}

export function getAccessTokenSync(): string | null {
  return accessToken && Date.now() < tokenExpiry ? accessToken : null;
}

export async function fetchUserInfo(token: string): Promise<GoogleUser> {
  const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error('Failed to fetch user info');
  const data = (await resp.json()) as { name?: string; email?: string; picture?: string };
  return { name: data.name ?? data.email ?? 'User', email: data.email ?? '', picture: data.picture };
}

export function revokeToken(): void {
  if (accessToken && window.google?.accounts?.oauth2) {
    google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
  tokenExpiry = 0;
}
