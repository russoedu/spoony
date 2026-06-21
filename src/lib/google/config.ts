// Public OAuth client ID (NOT a secret). The client secret must never ship in a
// frontend app — we use the PKCE/token flow which only needs the client ID.
export const GOOGLE_CLIENT_ID: string =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ??
  '837354348237-vocf88nf6lo131qnt1unr1noir6ioobl.apps.googleusercontent.com';

// drive.appdata = hidden, app-private folder. openid/email/profile = display name.
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.appdata',
  'openid',
  'email',
  'profile',
].join(' ');
