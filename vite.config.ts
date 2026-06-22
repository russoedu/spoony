/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
// HTTPS is on by default so the dev origin matches the authorised Google OAuth
// origin (https://localhost:3000). Set SPOONY_HTTP=1 to serve plain HTTP (useful
// for automated screenshots that reject self-signed certs).
const useHttps = !process.env.SPOONY_HTTP;

export default defineConfig({
  plugins: [
    react(),
    ...(useHttps ? [mkcert()] : []),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.svg'],
      manifest: {
        name: 'Spoony — Daily Energy Tracker',
        short_name: 'Spoony',
        description: 'Log your daily spoons (energy) based on Spoon Theory.',
        theme_color: '#7020D0',
        background_color: '#23232b',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'en',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Google APIs / GIS must always hit the network, and crawler-facing
        // static files must be served as-is, not bounced through the SPA shell.
        navigateFallbackDenylist: [/^\/api/, /^\/sitemap\.xml$/, /^\/robots\.txt$/],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: 'localhost',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
