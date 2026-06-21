import { Group, Text } from '@mantine/core';
import { IconCheck, IconCloudOff, IconLoader2 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/useStore';

/** Small autosave status pill (mirrors the "auto saving…" indicator in the mockups). */
export function SaveIndicator() {
  const { t } = useTranslation();
  const status = useStore((s) => s.saveStatus);

  if (status === 'idle') return null;

  const content = {
    saving: { icon: <IconLoader2 size={14} />, label: t('dailyLog.autoSaving'), color: 'dimmed' },
    saved: { icon: <IconCheck size={14} />, label: t('dailyLog.saved'), color: 'spoon' },
    offline: { icon: <IconCloudOff size={14} />, label: t('dailyLog.offline'), color: 'orange' },
  }[status];

  return (
    <Group gap={4} wrap="nowrap" c={content.color}>
      {content.icon}
      <Text size="xs" c={content.color}>
        {content.label}
      </Text>
    </Group>
  );
}
