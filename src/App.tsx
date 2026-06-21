import { useEffect } from 'react';
import { Center, Loader } from '@mantine/core';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { ThemeController } from '@/components/ThemeController';
import { InstallPrompt } from '@/components/InstallPrompt';
import { Layout } from '@/components/Layout';
import { SignInScreen } from '@/features/auth/SignInScreen';
import { DailyLogScreen } from '@/features/daily-log/DailyLogScreen';
import { HistoryScreen } from '@/features/history/HistoryScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { ActivitiesConfigScreen } from '@/features/activities/ActivitiesConfigScreen';

export function App() {
  const authStatus = useStore((s) => s.authStatus);
  const ready = useStore((s) => s.ready);
  const restoreSession = useStore((s) => s.restoreSession);
  const setOnline = useStore((s) => s.setOnline);

  useEffect(() => {
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

  if (authStatus === 'restoring') {
    return (
      <Center mih="100dvh">
        <Loader />
      </Center>
    );
  }

  if (authStatus !== 'authed') {
    return <SignInScreen />;
  }

  if (!ready) {
    return (
      <Center mih="100dvh">
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <ThemeController />
      <FirstRunRedirect />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DailyLogScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/settings/activities" element={<ActivitiesConfigScreen />} />
        </Route>
      </Routes>
      <InstallPrompt />
    </>
  );
}

/** On the very first sign-in, send the user straight to the activities editor. */
function FirstRunRedirect() {
  const navigate = useNavigate();
  const firstRun = useStore((s) => s.firstRun);
  const clearFirstRun = useStore((s) => s.clearFirstRun);
  useEffect(() => {
    if (firstRun) {
      navigate('/settings/activities');
      clearFirstRun();
    }
  }, [firstRun, navigate, clearFirstRun]);
  return null;
}
