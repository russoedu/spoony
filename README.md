# spoony

Daily **spoon** (energy) logger based on [Spoon Theory](https://en.wikipedia.org/wiki/Spoon_theory),
built for autistic and chronically-ill people. Installable PWA, fully client-side, with all
data stored **encrypted in a private folder on your own Google Drive** — there is no backend
and no server ever sees your data.

Built with **React + Vite + TypeScript**, **Mantine**, and a Google Drive `appDataFolder`
sync layer. Deploys to **Firebase Hosting**.

## Features

- Daily log with **Estimated** vs **Used** columns and a live spoon balance
- Configurable activities: wake-up spoons · takes/gives (counted) · numeric scale (e.g. pain 0–10) · note fields
- Drag-to-reorder, inline edit, per-activity default values (the configurator)
- History: pick any past date and edit it
- **English & Portuguese** with smart browser-language detection; adding a language = one JSON file
- Light / dark / system theme
- Offline-first (IndexedDB cache) with background Drive sync and an autosave indicator
- "Add to home screen" install prompt

## Prerequisites

- Node.js 20+ (developed on Node 24)
- A Google Cloud OAuth **Web** client ID with `https://localhost:3000` as an authorised
  JavaScript origin (already configured for this project).

## Develop

```bash
npm install
npm run dev          # serves HTTPS on https://localhost:3000
```

> **HTTPS is required.** Google Identity Services only works over `https`, and the OAuth
> origin is registered as `https://localhost:3000`. The dev server uses a self-signed
> certificate (`@vitejs/plugin-basic-ssl`) — your browser shows a one-time warning; accept
> it to continue. Do **not** use `http`, it will not authenticate.
>
> (`SPOONY_HTTP=1 npm run dev` exists only for automated screenshot tooling that can't accept
> self-signed certs; it disables OAuth and must not be used for real sign-in.)

### Environment

The OAuth **client ID** (not a secret) is read from `VITE_GOOGLE_CLIENT_ID`, falling back to
the project default. Copy `.env.example` to `.env` to override. The OAuth **client secret is
never used** — this app uses the PKCE/token flow, so no secret ships in the frontend.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | HTTPS dev server on port 3000 |
| `npm run build` | Type-check + production build to `dist/` (generates the service worker) |
| `npm run preview` | Preview the production build |
| `npm test` | Run unit tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `node scripts/generate-icons.mjs` | Regenerate PWA icons from `public/logo.svg` |

## Data & encryption

- One encrypted JSON file per day (`day-YYYY-MM-DD.json`) plus `config.json`, stored in the
  hidden Drive `appDataFolder` (scope `drive.appdata`).
- Account-based encryption: a random AES-GCM key (`key.json` in the same folder) encrypts all
  payloads on-device before upload. The crypto layer (`src/lib/crypto`) is isolated so a
  passphrase / zero-knowledge mode can be added later.

## Project structure

```
src/
  main.tsx, App.tsx          app entry + routing/auth gating
  providers/                 Mantine theme, i18n
  components/                Layout, Wordmark, InstallPrompt, SaveIndicator, icons
  features/
    auth/                    sign-in screen
    daily-log/               main screen, rows, spoon balance, other activities
    activities/              configurator (reorder, type cycle, defaults)
    history/                 date picker + past-day editing
    settings/                settings menu, JSON export
  lib/
    google/                  gis-auth.ts, drive.ts, config.ts
    crypto/                  AES-GCM (swappable interface)
    storage/                 db.ts (IndexedDB), sync.ts (Drive sync)
    spoons.ts, day.ts        balance math, day helpers
  data/defaultActivities.ts  default activity list (from the paper sheet)
  locales/                   en.json, pt.json
  types/
public/                      logo.svg, icons, manifest assets
firebase.json, .firebaserc
```

## Deploy (Firebase Hosting)

```bash
npm run build
npx firebase-tools@latest login
npx firebase-tools@latest deploy --only hosting   # project: spoony-500006
```

After deploying, **add the production origin** (e.g. `https://spoony-500006.web.app`) to the
OAuth client's *Authorized JavaScript origins* in Google Cloud Console.

## Security note

The OAuth **client secret must never be committed or shipped**. `client_secret*.json` is
git-ignored. If a secret has been shared, rotate it in Google Cloud Console.
