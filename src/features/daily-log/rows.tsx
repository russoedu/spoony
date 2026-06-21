import { Group, NumberInput, Slider, Stack, Text, Textarea } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Activity, CountedValue, NoteValue, NumericValue } from '@/types';
import { ActivityIcon } from '@/components/ActivityIcon';
import { activityLabel } from '@/providers/i18n';

function toNumber(v: number | string): number | undefined {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

function useLabel(activity: Activity): string {
  const { t } = useTranslation();
  return activityLabel(t, activity.id, activity.label);
}

interface RowProps<V> {
  activity: Activity;
  value: V;
  onChange: (value: V) => void;
}

/** A counted takes/gives row: two columns, Estimated and Used. */
export function CountedRow({ activity, value, onChange }: RowProps<CountedValue>) {
  const { t } = useTranslation();
  const label = useLabel(activity);
  return (
    <Stack gap={4}>
      <Group gap="xs" wrap="nowrap">
        <ActivityIcon type={activity.type} />
        <Text fw={500}>{label}</Text>
      </Group>
      <Group grow wrap="nowrap">
        <NumberInput
          size="sm"
          label={t('dailyLog.estimated')}
          min={0}
          value={value.estimated ?? ''}
          onChange={(v) => onChange({ ...value, estimated: toNumber(v) })}
        />
        <NumberInput
          size="sm"
          label={activity.type === 'gives' ? t('dailyLog.gained') : t('dailyLog.used')}
          min={0}
          value={value.used ?? ''}
          onChange={(v) => onChange({ ...value, used: toNumber(v) })}
        />
      </Group>
    </Stack>
  );
}

/** The wake-up spoons row: a single value (stored as `used`). */
export function WakeupRow({ activity, value, onChange }: RowProps<CountedValue>) {
  const label = useLabel(activity);
  return (
    <Group justify="space-between" wrap="nowrap">
      <Group gap="xs" wrap="nowrap">
        <ActivityIcon type={activity.type} />
        <Text fw={600}>{label}</Text>
      </Group>
      <NumberInput
        size="sm"
        w={110}
        min={0}
        value={value.used ?? ''}
        onChange={(v) => onChange({ ...value, used: toNumber(v) })}
      />
    </Group>
  );
}

/** A numeric scale (e.g. pain 0-10): slider + value, recorded only. */
export function NumericRow({ activity, value, onChange }: RowProps<NumericValue>) {
  const label = useLabel(activity);
  const max = activity.numericMax ?? 10;
  const current = value.value ?? 0;
  return (
    <Stack gap={4}>
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <ActivityIcon type={activity.type} />
          <Text fw={500}>{label}</Text>
        </Group>
        <Text fw={600} c="dimmed">
          {value.value ?? '–'}
        </Text>
      </Group>
      <Slider
        min={0}
        max={max}
        step={1}
        value={current}
        marks={[
          { value: 0, label: '0' },
          { value: max, label: String(max) },
        ]}
        onChange={(v) => onChange({ value: v })}
        mb="sm"
      />
    </Stack>
  );
}

/** A free-text note field. */
export function NoteRow({ activity, value, onChange }: RowProps<NoteValue>) {
  const { t } = useTranslation();
  const label = useLabel(activity);
  return (
    <Stack gap={4}>
      <Group gap="xs" wrap="nowrap">
        <ActivityIcon type={activity.type} />
        <Text fw={500}>{label}</Text>
      </Group>
      <Textarea
        autosize
        minRows={2}
        placeholder={t('dailyLog.notePlaceholder')}
        value={value.text ?? ''}
        onChange={(e) => onChange({ text: e.currentTarget.value })}
      />
    </Stack>
  );
}
