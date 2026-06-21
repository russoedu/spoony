import { Group, Image, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface WordmarkProps {
  size?: number;
  withIcon?: boolean;
  withTagline?: boolean;
}

/** The "spoony" script wordmark, optionally with the spoon icon and tagline. */
export function Wordmark({ size = 36, withIcon = true, withTagline = false }: WordmarkProps) {
  const { t } = useTranslation();
  return (
    <div>
      <Group gap="xs" align="center" wrap="nowrap">
        <Text className="spoony-wordmark" fz={size} lh={1} fw={400}>
          {t('app.name')}
        </Text>
        {withIcon && <Image src="/logo.svg" alt="" w={size} h={size} />}
      </Group>
      {withTagline && (
        <Text className="spoony-wordmark" fz={size * 0.4} c="dimmed" mt={2}>
          {t('app.tagline')}
        </Text>
      )}
    </div>
  );
}
