import { useEffect, useState } from 'react';
import { Affix, Button, CloseButton, Group, Paper, Text } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'spoony.installDismissed';

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** "Add to home screen" call-to-action. Uses beforeinstallprompt where available
 * and falls back to manual instructions on iOS. */
export function InstallPrompt() {
  const { t } = useTranslation();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // iOS has no event — show manual instructions after a short delay.
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIOS()) iosTimer = setTimeout(() => setVisible(true), 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  };

  return (
    <Affix position={{ bottom: 20, left: 20, right: 20 }}>
      <Paper withBorder shadow="md" p="md" radius="md" maw={460} mx="auto">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div style={{ flex: 1 }}>
            <Text fw={600}>{t('install.cta')}</Text>
            {!deferred && isIOS() && (
              <Text size="sm" c="dimmed" mt={4}>
                {t('install.iosInstructions')}
              </Text>
            )}
          </div>
          <CloseButton aria-label={t('install.dismiss')} onClick={dismiss} />
        </Group>
        {deferred && (
          <Group justify="flex-end" mt="sm">
            <Button variant="subtle" color="gray" onClick={dismiss}>
              {t('install.dismiss')}
            </Button>
            <Button leftSection={<IconDownload size={16} />} onClick={install}>
              {t('install.install')}
            </Button>
          </Group>
        )}
      </Paper>
    </Affix>
  );
}
