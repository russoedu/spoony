import { useEffect } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { useStore } from '@/store/useStore';

/** Syncs the persisted theme preference into Mantine's color scheme. */
export function ThemeController() {
  const { setColorScheme } = useMantineColorScheme();
  const theme = useStore((s) => s.config?.settings.theme);

  useEffect(() => {
    if (!theme) return;
    setColorScheme(theme === 'system' ? 'auto' : theme);
  }, [theme, setColorScheme]);

  return null;
}
