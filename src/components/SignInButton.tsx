import { Badge, Button, Stack, Text } from '@mantine/core';
import { IconBrandGoogle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/useStore';

export function SignInButton({ size = 'md' }: { size?: string }) {
  const { t } = useTranslation();
  const signIn = useStore((s) => s.signIn);
  const status = useStore((s) => s.authStatus);
  const authError = useStore((s) => s.authError);
  return (
    <Stack align="center" gap={6}>
      <Button
        size={size}
        radius="xl"
        leftSection={<IconBrandGoogle size={18} />}
        loading={status === 'connecting'}
        onClick={() => void signIn()}
      >
        {t('auth.signIn')}
      </Button>
      {status === 'error' && (
        <Stack align="center" gap={4} maw={320}>
          <Badge color="red" variant="filled">
            {t('auth.error')}
          </Badge>
          {authError && (
            <Text size="xs" c="red" ta="center" style={{ wordBreak: 'break-word' }}>
              {authError}
            </Text>
          )}
        </Stack>
      )}
    </Stack>
  );
}
