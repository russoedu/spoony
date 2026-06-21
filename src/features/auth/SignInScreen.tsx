import { Button, Center, Image, Loader, Stack, Text } from '@mantine/core';
import { IconBrandGoogle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Wordmark } from '@/components/Wordmark';
import { useStore } from '@/store/useStore';

export function SignInScreen() {
  const { t } = useTranslation();
  const status = useStore((s) => s.authStatus);
  const error = useStore((s) => s.authError);
  const signIn = useStore((s) => s.signIn);

  const connecting = status === 'connecting';

  return (
    <Center mih="100dvh" p="xl">
      <Stack align="center" gap="xl" maw={360} w="100%">
        <Image src="/logo.svg" alt="Spoony" w={180} h={180} radius="lg" />
        <Wordmark size={48} withIcon={false} withTagline />

        {connecting ? (
          <Stack align="center" gap="sm" mt="xl">
            <Loader />
            <Text c="dimmed">{t('auth.connecting')}</Text>
          </Stack>
        ) : (
          <Stack align="center" gap="md" mt="xl" w="100%">
            <Text ta="center">{t('auth.connectTitle')}</Text>
            <Text ta="center" size="sm" c="dimmed">
              {t('auth.encryptedNote')}
            </Text>
            {error && (
              <Text ta="center" size="sm" c="red">
                {t('auth.error')}
              </Text>
            )}
            <Button
              size="md"
              radius="xl"
              fullWidth
              leftSection={<IconBrandGoogle size={18} />}
              onClick={() => void signIn()}
            >
              {status === 'error' ? t('auth.retry') : t('auth.signIn')}
            </Button>
          </Stack>
        )}
      </Stack>
    </Center>
  );
}
