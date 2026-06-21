import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Image,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconAdjustmentsHeart,
  IconBrandGoogle,
  IconDeviceMobile,
  IconLanguage,
  IconLock,
  IconMoonStars,
  IconShieldCheck,
  IconWifiOff,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/useStore';
import i18n, { SUPPORTED_LANGUAGES } from '@/providers/i18n';

function SignInButton({ size = 'md' }: { size?: string }) {
  const { t } = useTranslation();
  const signIn = useStore((s) => s.signIn);
  const status = useStore((s) => s.authStatus);
  return (
    <Button
      size={size}
      radius="xl"
      leftSection={<IconBrandGoogle size={18} />}
      loading={status === 'connecting'}
      onClick={() => void signIn()}
    >
      {t('auth.signIn')}
    </Button>
  );
}

export function LandingPage() {
  const { t } = useTranslation();

  const steps = [
    { title: t('marketing.how1Title'), body: t('marketing.how1Body') },
    { title: t('marketing.how2Title'), body: t('marketing.how2Body') },
    { title: t('marketing.how3Title'), body: t('marketing.how3Body') },
  ];

  const shots = [
    { src: '/screenshots/daily.png', label: t('marketing.shotDaily') },
    { src: '/screenshots/config.png', label: t('marketing.shotConfig') },
    { src: '/screenshots/settings.png', label: t('marketing.shotSettings') },
  ];

  const features = [
    { icon: IconLock, title: t('marketing.featPrivateTitle'), body: t('marketing.featPrivateBody') },
    { icon: IconWifiOff, title: t('marketing.featOfflineTitle'), body: t('marketing.featOfflineBody') },
    { icon: IconAdjustmentsHeart, title: t('marketing.featCustomTitle'), body: t('marketing.featCustomBody') },
    { icon: IconDeviceMobile, title: t('marketing.featInstallTitle'), body: t('marketing.featInstallBody') },
    { icon: IconLanguage, title: t('marketing.featLangTitle'), body: t('marketing.featLangBody') },
    { icon: IconMoonStars, title: t('marketing.featThemeTitle'), body: t('marketing.featThemeBody') },
  ];

  return (
    <Box>
      {/* Top bar */}
      <Container size="lg" py="sm">
        <Group justify="space-between">
          <Image src="/full-logo.svg" alt="Spoony" h={40} w="auto" fit="contain" />
          <Group gap="sm">
            <SegmentedControl
              size="xs"
              value={SUPPORTED_LANGUAGES.includes(i18n.resolvedLanguage as never) ? (i18n.resolvedLanguage as string) : 'en'}
              onChange={(v) => void i18n.changeLanguage(v)}
              data={SUPPORTED_LANGUAGES.map((l) => ({ value: l, label: l.toUpperCase() }))}
            />
            <Box visibleFrom="xs">
              <SignInButton size="sm" />
            </Box>
          </Group>
        </Group>
      </Container>

      {/* Hero */}
      <Box
        style={{
          background:
            'linear-gradient(135deg, var(--mantine-color-grape-6), var(--mantine-color-spoon-6))',
        }}
      >
        <Container size="md" py={64}>
          <Stack align="center" gap="lg" ta="center">
            <Image src="/logo.svg" alt="" w={104} h={104} radius="xl" />
            <Title order={1} c="white" fz={{ base: 32, sm: 44 }} maw={620}>
              {t('marketing.lead')}
            </Title>
            <Text c="white" fz={{ base: 'md', sm: 'lg' }} maw={560} opacity={0.95}>
              {t('marketing.sub')}
            </Text>
            <SignInButton size="lg" />
            <Badge
              size="lg"
              variant="white"
              c="grape"
              leftSection={<IconShieldCheck size={14} />}
            >
              {t('marketing.privacyBadge')}
            </Badge>
          </Stack>
        </Container>
      </Box>

      {/* What's a spoon */}
      <Container size="sm" py={56}>
        <Card withBorder radius="lg" padding="xl" bg="var(--mantine-color-grape-light)">
          <Title order={2} mb="sm">
            {t('marketing.spoonTitle')}
          </Title>
          <Text fz="lg">{t('marketing.spoonBody')}</Text>
        </Card>
      </Container>

      {/* How it works */}
      <Container size="lg" pb={56}>
        <Title order={2} ta="center" mb="xl">
          {t('marketing.howTitle')}
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          {steps.map((step, i) => (
            <Card key={i} withBorder radius="lg" padding="lg">
              <ThemeIcon size={44} radius="xl" variant="gradient" mb="sm">
                <Text fw={700} fz="lg">
                  {i + 1}
                </Text>
              </ThemeIcon>
              <Text fw={700} fz="lg">
                {step.title}
              </Text>
              <Text c="dimmed" mt={4}>
                {step.body}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      {/* Screenshots */}
      <Box bg="var(--mantine-color-default-hover)">
        <Container size="lg" py={56}>
          <Title order={2} ta="center" mb="xl">
            {t('marketing.shotsTitle')}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
            {shots.map((shot) => (
              <Stack key={shot.src} align="center" gap="sm">
                <Image
                  src={shot.src}
                  alt={shot.label}
                  radius="lg"
                  fit="contain"
                  style={{
                    maxHeight: 520,
                    boxShadow: 'var(--mantine-shadow-lg)',
                    border: '1px solid var(--mantine-color-default-border)',
                  }}
                />
                <Text fw={600}>{shot.label}</Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features */}
      <Container size="lg" py={56}>
        <Title order={2} ta="center" mb="xl">
          {t('marketing.featuresTitle')}
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {features.map((f) => (
            <Card key={f.title} withBorder radius="lg" padding="lg">
              <ThemeIcon size={40} radius="md" variant="light" color="grape" mb="sm">
                <f.icon size={22} />
              </ThemeIcon>
              <Text fw={700}>{f.title}</Text>
              <Text c="dimmed" mt={4} fz="sm">
                {f.body}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      {/* Footer CTA */}
      <Box
        style={{
          background:
            'linear-gradient(135deg, var(--mantine-color-grape-7), var(--mantine-color-grape-5))',
        }}
      >
        <Container size="sm" py={64}>
          <Stack align="center" gap="lg" ta="center">
            <Title order={2} c="white">
              {t('marketing.footerCta')}
            </Title>
            <SignInButton size="lg" />
            <Text c="white" opacity={0.9} fz="sm">
              {t('marketing.footerNote')}
            </Text>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
