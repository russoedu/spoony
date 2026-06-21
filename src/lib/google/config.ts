// Public OAuth client ID (NOT a secret). The client secret must never ship in a
// frontend app — we use the PKCE/token flow which only needs the client ID.
//
// Use `||` (not `??`) and trim: CI builds the app with
// `VITE_GOOGLE_CLIENT_ID: ${{ vars.VITE_GOOGLE_CLIENT_ID }}`, which expands to an
// empty string when the repo variable is unset. `??` would keep that empty value
// and GIS would fail with "Missing required parameter client_id"; this falls back
// to the default whenever the env var is missing OR blank.
const ENV_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();
export const GOOGLE_CLIENT_ID: string =
  ENV_CLIENT_ID || '837354348237-vocf88nf6lo131qnt1unr1noir6ioobl.apps.googleusercontent.com';

// drive.appdata = hidden, app-private folder. openid/email/profile = display name.
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.appdata',
  'openid',
  'email',
  'profile',
].join(' ');
