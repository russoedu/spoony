import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter } from 'react-router-dom';
import iosPWASplash from 'ios-pwa-splash';
import 'dayjs/locale/pt';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

import './providers/i18n';
import { theme } from './providers/theme';
import { App } from './App';
import { useStore } from './store/useStore';

// Generate iOS standalone splash screens from the wordmark on the brand purple.
iosPWASplash('/splash.png', '#7020d1');

// Expose the store for local debugging/automated checks (dev builds only).
if (import.meta.env.DEV) {
  (window as unknown as { useStore: typeof useStore }).useStore = useStore;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorSchemeScript defaultColorScheme="auto" />
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications position="bottom-center" />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>
);
