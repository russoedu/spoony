import { ActionIcon, Button, Group, NumberInput, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { DayEntry, OtherActivity } from '@/types';
import { ActivityIcon } from '@/components/ActivityIcon';

interface Props {
  day: DayEntry;
  onChange: (mutate: (draft: DayEntry) => void) => void;
}

function toNumber(v: number | string): number | undefined {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

export function OtherActivities({ day, onChange }: Props) {
  const { t } = useTranslation();

  const add = () =>
    onChange((draft) => {
      const item: OtherActivity = {
        id: `o-${Date.now().toString(36)}`,
        label: '',
        type: 'takes',
      };
      draft.otherActivities.push(item);
    });

  const patch = (id: string, p: Partial<OtherActivity>) =>
    onChange((draft) => {
      const item = draft.otherActivities.find((o) => o.id === id);
      if (item) Object.assign(item, p);
    });

  const remove = (id: string) =>
    onChange((draft) => {
      draft.otherActivities = draft.otherActivities.filter((o) => o.id !== id);
    });

  return (
    <Stack gap="sm">
      <Text fw={600}>{t('dailyLog.otherActivities')}</Text>
      {day.otherActivities.map((item) => (
        <Stack key={item.id} gap={4}>
          <Group gap="xs" wrap="nowrap">
            <ActionIcon
              variant="subtle"
              aria-label="toggle type"
              onClick={() => patch(item.id, { type: item.type === 'takes' ? 'gives' : 'takes' })}
            >
              <ActivityIcon type={item.type} />
            </ActionIcon>
            <TextInput
              style={{ flex: 1 }}
              size="sm"
              placeholder={t('dailyLog.otherLabel')}
              value={item.label}
              onChange={(e) => patch(item.id, { label: e.currentTarget.value })}
            />
            <ActionIcon variant="subtle" color="red" aria-label={t('common.delete')} onClick={() => remove(item.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
          <Group grow wrap="nowrap">
            <NumberInput
              size="sm"
              label={t('dailyLog.estimated')}
              min={0}
              value={item.estimated ?? ''}
              onChange={(v) => patch(item.id, { estimated: toNumber(v) })}
            />
            <NumberInput
              size="sm"
              label={t('dailyLog.used')}
              min={0}
              value={item.used ?? ''}
              onChange={(v) => patch(item.id, { used: toNumber(v) })}
            />
          </Group>
        </Stack>
      ))}
      <Button variant="light" leftSection={<IconPlus size={16} />} onClick={add}>
        {t('dailyLog.addOther')}
      </Button>
    </Stack>
  );
}
