import { InstallPrompt } from '@/components/InstallPrompt';
import { LayoutApp } from '@/components/LayoutApp';
import { LayoutPublic } from '@/components/LayoutPublic';
import { ThemeController } from '@/components/ThemeController';
import { ActivitiesConfigScreen } from '@/features/activities/ActivitiesConfigScreen';
import { DailyLogScreen } from '@/features/daily-log/DailyLogScreen';
import { HistoryScreen } from '@/features/history/HistoryScreen';
import { PrivacyPolicyScreen, TermsOfServiceScreen } from '@/features/legal/LegalPage';
import { LandingPage } from '@/features/marketing/LandingPage';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { preloadGis } from '@/lib/google/gis-auth';
import { useStore } from '@/store/useStore';
import { Center, Loader } from '@mantine/core';
import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';

function FullscreenLoader() {
  return (
    <Center mih="100dvh">
      <Loader />
    </Center>
  );
}

/** The "/" route: bounces a signed-in user straight into /app, otherwise shows the marketing page. */
function RootRoute() {
  const authStatus = useStore((s) => s.authStatus);
  if (authStatus === 'restoring') return <FullscreenLoader />;
  if (authStatus === 'authed') return <Navigate to="/app" replace />;
  return <LandingPage />;
}

/** Gate for everything under /app: redirects to the landing page when signed out. */
function ProtectedRoute() {
  const authStatus = useStore((s) => s.authStatus);
  const ready = useStore((s) => s.ready);

  if (authStatus === 'restoring') return <FullscreenLoader />;
  if (authStatus !== 'authed') return <Navigate to="/" replace />;
  if (!ready) return <FullscreenLoader />;

  return (
    <>
      <ThemeController />
      <FirstRunRedirect />
      <Outlet />
      <InstallPrompt />
    </>
  );
}

export function App() {
  const restoreSession = useStore((s) => s.restoreSession);
  const setOnline = useStore((s) => s.setOnline);

  useEffect(() => {
    preloadGis(); // ready the OAuth popup before the user clicks sign-in
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, [setOnline]);

  return (
    <Routes>
      <Route element={<LayoutPublic />}>
        <Route path="/" element={<RootRoute />} />
        <Route path="/privacy" element={<PrivacyPolicyScreen />} />
        <Route path="/terms" element={<TermsOfServiceScreen />} />
      </Route>

      <Route path="/app" element={<ProtectedRoute />}>
        <Route element={<LayoutApp />}>
          <Route index element={<DailyLogScreen />} />
          <Route path="history" element={<HistoryScreen />} />
          <Route path="settings" element={<SettingsScreen />} />
          <Route path="settings/activities" element={<ActivitiesConfigScreen />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/** On the very first sign-in, send the user straight to the activities editor. */
function FirstRunRedirect() {
  const navigate = useNavigate();
  const firstRun = useStore((s) => s.firstRun);
  const clearFirstRun = useStore((s) => s.clearFirstRun);
  useEffect(() => {
    if (firstRun) {
      navigate('/app/settings/activities');
      clearFirstRun();
    }
  }, [firstRun, navigate, clearFirstRun]);
  return null;
}
