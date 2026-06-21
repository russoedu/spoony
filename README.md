<div align="center">

<img src="public/logo.svg" alt="Spoony logo" width="120" height="120" />

# Spoony

**A daily energy tracker for people who live by [Spoon Theory](https://en.wikipedia.org/wiki/Spoon_theory).**

[**▶ Open the app — spoony.web.app**](https://spoony.web.app)

Installable PWA · works offline · your data stays private on **your own** Google Drive

</div>

---

## What is Spoony?

[Spoon Theory](https://en.wikipedia.org/wiki/Spoon_theory) is a way many autistic, disabled and
chronically-ill people describe energy: you start each day with a limited number of **spoons**,
and every activity spends some — while rest and certain activities give a few back. Spoony turns
that idea into a simple daily log so you can **plan your day, pace yourself, and notice patterns**.

Each day you record:

- 🥄 the **spoons you woke up with**
- 📉 activities that **take** spoons (get ready, cook, chores, appointments…)
- 📈 activities that **give** spoons back (rest, a nap, a hobby, therapy…)
- 🌡️ a **0–10 scale** for things like pain
- 📝 free-text notes (how you slept, your plan, what you need/want)

For every activity you log an **Estimated** amount (your plan for the day) and a **Used** amount
(what actually happened), and Spoony shows a **live running balance** so you can see how many
spoons you have left.

## Why it's private

- There is **no Spoony server and no database**. The app runs entirely in your browser.
- Your logs are stored in a **hidden, app-private folder on your own Google Drive**
  (the `drive.appdata` space) — not visible alongside your normal files.
- Everything is **encrypted on your device** (AES-GCM) before it's uploaded. Spoony only ever
  asks Google for access to its own private folder, nothing else in your Drive.
- Sign-in uses Google's modern token flow — **no password and no client secret** ever touch the app.

## Features

- 📲 **Installable PWA** with an "add to home screen" prompt; runs full-screen like a native app
- 🔌 **Offline-first** — log anytime; changes sync to Drive in the background (with an autosave indicator)
- 🧩 **Fully customisable activities** — add, rename, reorder (drag & drop), delete, change type,
  and set default values; pick from wake-up spoons / takes / gives / 0–10 scale / note
- 🗓️ **History** — jump to any past date and edit it
- 🌍 **English & Portuguese**, with automatic language detection and an easy path to add more
- 🌗 **Light / dark / system** theme
- ⬇️ **Export your data** as JSON at any time

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | React 19 + Vite + TypeScript |
| UI | Mantine |
| State | Zustand |
| Storage | IndexedDB (offline cache) + Google Drive `appDataFolder` (sync) |
| Encryption | Web Crypto API (AES-GCM) |
| i18n | i18next / react-i18next |
| PWA | vite-plugin-pwa (Workbox) |
| Hosting / CI | Firebase Hosting + GitHub Actions |

## Using the app

Just open **[spoony.web.app](https://spoony.web.app)**, sign in with Google, and start logging.
On mobile, use your browser's **Add to Home Screen** to install it.

## Development

Requirements: **Node.js 22+**.

```bash
npm install
npm run dev      # https://localhost:3000
```

> **HTTPS is required.** Google sign-in only works over `https`, and the dev origin is
> registered with Google OAuth as `https://localhost:3000`. The dev server uses
> `vite-plugin-mkcert`, which installs a local certificate authority on first run so the
> certificate is trusted (no browser warning). Do **not** use plain `http` — it will not
> authenticate. (`SPOONY_HTTP=1 npm run dev` exists only for tooling that can't accept the
> local cert; it disables sign-in.)

The OAuth **client ID** (public, not a secret) is read from `VITE_GOOGLE_CLIENT_ID` and falls
back to the project default; copy `.env.example` to `.env` to override.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | HTTPS dev server on port 3000 |
| `npm run build` | Type-check + production build to `dist/` (also emits the service worker) |
| `npm run preview` | Preview the production build |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `node scripts/generate-icons.mjs` | Regenerate PWA icons from `public/logo.svg` |

## Project structure

```
src/
  main.tsx, App.tsx          entry + routing / auth gating
  providers/                 Mantine theme, i18n
  components/                Layout, Wordmark, InstallPrompt, SaveIndicator, icons
  features/
    auth/                    sign-in screen
    daily-log/               main screen, rows, spoon balance, other activities
    activities/              configurator (reorder, type cycle, defaults)
    history/                 date picker + past-day editing
    settings/                settings menu, JSON export
  lib/
    google/                  GIS auth, Drive appData client
    crypto/                  AES-GCM (swappable interface)
    storage/                 IndexedDB + Drive sync
    spoons.ts, day.ts        balance math, day helpers
  data/defaultActivities.ts  default activity list
  locales/                   en.json, pt.json
  types/
public/                      logo, icons, manifest assets
```

## Adding a language

1. Copy `src/locales/en.json` to `src/locales/<lang>.json` and translate the values
   (including the `activity.*` default labels).
2. Register it in `src/providers/i18n.ts` (`resources` + `SUPPORTED_LANGUAGES`).

Default activity labels follow the selected language automatically; labels you customise in the
app are stored as-is and aren't translated.

## Deployment & CI

Hosted on **Firebase Hosting** (project `spoony-500006`, site `spoony`). GitHub Actions:

- **push to `main`** → lint + test + build → deploy to **live** (`spoony.web.app`)
- **pull request** → deploy a **preview** channel and comment the URL on the PR

The deploy step needs a Firebase service-account secret named
`FIREBASE_SERVICE_ACCOUNT_SPOONY_500006`; create it once with:

```bash
npx firebase-tools@latest init hosting:github
```

If the secret isn't present, the workflows still run lint/test/build and simply skip the deploy.
Manual deploy: `npm run build && npx firebase-tools@latest deploy --only hosting`.

After the first live deploy, ensure `https://spoony.web.app` and `https://spoony.firebaseapp.com`
are listed as **Authorized JavaScript origins** on the OAuth client in Google Cloud Console.

## Security

The OAuth **client secret is never used or shipped** (the app uses the PKCE/token flow).
`client_secret*.json`, `.env`, and certificates are git-ignored. If a secret is ever exposed,
rotate it in Google Cloud Console.

## License

[MIT](LICENSE)
