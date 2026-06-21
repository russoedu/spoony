import { Anchor, Box, Button, Container, Group, Image, SegmentedControl } from '@mantine/core';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n, { SUPPORTED_LANGUAGES } from '@/providers/i18n';
import { useStore } from '@/store/useStore';
import { SignInButton } from './SignInButton';

/** Shared header + footer for the public pages: landing, privacy policy, terms of service. */
export function PublicLayout() {
  const { t } = useTranslation();
  const authStatus = useStore((s) => s.authStatus);

  return (
    <Box>
      <Container h={80} py="sm">
        <Group justify="space-between">
          <Anchor component={Link} to="/" underline="never">
            <Image src="/full-logo.svg" alt="Spoony" h={40} w="auto" fit="contain" />
          </Anchor>
          <Group gap="sm">
            <SegmentedControl
              size="xs"
              value={
                SUPPORTED_LANGUAGES.includes(i18n.resolvedLanguage as never)
                  ? (i18n.resolvedLanguage as string)
                  : 'en'
              }
              onChange={(v) => void i18n.changeLanguage(v)}
              data={SUPPORTED_LANGUAGES.map((l) => ({ value: l, label: l.toUpperCase() }))}
            />
            <Box visibleFrom="xs">
              {authStatus === 'authed' ? (
                <Button component={Link} to="/app" radius="xl" size="sm">
                  {t('marketing.openApp')}
                </Button>
              ) : (
                <SignInButton size="sm" />
              )}
            </Box>
          </Group>
        </Group>
      </Container>

      <Outlet />

      <Container size="sm" py="md">
        <Group justify="center" gap="md">
          <Anchor component={Link} to="/privacy" size="sm" c="dimmed">
            {t('marketing.privacyLink')}
          </Anchor>
          <Anchor component={Link} to="/terms" size="sm" c="dimmed">
            {t('marketing.termsLink')}
          </Anchor>
        </Group>
      </Container>
    </Box>
  );
}
