import { useMemo } from 'react';
import { ActionIcon, Center, Divider, Group, Loader, Stack, Text, TextInput } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import type { CountedValue, DayValue, NoteValue, NumericValue } from '@/types';
import { useStore } from '@/store/useStore';
import { dateToISO, todayISO } from '@/lib/day';
import { SpoonBalanceBar } from './SpoonBalanceBar';
import { OtherActivities } from './OtherActivities';
import { CountedRow, NoteRow, NumericRow, WakeupRow } from './rows';

export function DailyLogScreen() {
  const { t, i18n } = useTranslation();
  const config = useStore((s) => s.config);
  const day = useStore((s) => s.currentDay);
  const currentDate = useStore((s) => s.currentDate);
  const updateDay = useStore((s) => s.updateDay);
  const setDate = useStore((s) => s.setDate);

  const activities = useMemo(
    () => (config?.activities ?? []).filter((a) => a.enabled).sort((a, b) => a.order - b.order),
    [config]
  );

  const counted = activities.filter((a) => a.type !== 'note');
  const notes = activities.filter((a) => a.type === 'note');

  if (!day || !config) {
    return (
      <Center mih="60vh">
        <Loader />
      </Center>
    );
  }

  const setValue = (id: string, value: DayValue) =>
    updateDay((draft) => {
      draft.values[id] = value;
    });

  const shiftDay = (delta: number) =>
    void setDate(dateToISO(dayjs(currentDate).add(delta, 'day').toDate()));

  const isToday = currentDate === todayISO();
  const dateLabel = dayjs(currentDate).locale(i18n.language).format('ddd, D MMM YYYY');

  return (
    <Stack gap="md" pb={120}>
      <Group justify="space-between" wrap="nowrap">
        <ActionIcon variant="subtle" aria-label="previous day" onClick={() => shiftDay(-1)}>
          <IconChevronLeft />
        </ActionIcon>
        <Text fw={600}>{isToday ? t('common.today') : dateLabel}</Text>
        <ActionIcon
          variant="subtle"
          aria-label="next day"
          disabled={isToday}
          onClick={() => shiftDay(1)}
        >
          <IconChevronRight />
        </ActionIcon>
      </Group>

      <SpoonBalanceBar day={day} activities={config.activities} />

      <TextInput
        label={t('dailyLog.wokeUpAt')}
        placeholder="07:30"
        value={day.wakeTime ?? ''}
        onChange={(e) => updateDay((draft) => void (draft.wakeTime = e.currentTarget.value))}
        w={160}
      />

      <Stack gap="lg">
        {counted.map((activity) => {
          const value = day.values[activity.id] ?? {};
          if (activity.type === 'wakeup') {
            return (
              <WakeupRow
                key={activity.id}
                activity={activity}
                value={value as CountedValue}
                onChange={(v) => setValue(activity.id, v)}
              />
            );
          }
          if (activity.type === 'numeric') {
            return (
              <NumericRow
                key={activity.id}
                activity={activity}
                value={value as NumericValue}
                onChange={(v) => setValue(activity.id, v)}
              />
            );
          }
          return (
            <CountedRow
              key={activity.id}
              activity={activity}
              value={value as CountedValue}
              onChange={(v) => setValue(activity.id, v)}
            />
          );
        })}
      </Stack>

      <Divider />
      <OtherActivities day={day} onChange={updateDay} />

      {notes.length > 0 && (
        <>
          <Divider label={t('dailyLog.feelSection')} labelPosition="center" />
          <Stack gap="lg">
            {notes.map((activity) => (
              <NoteRow
                key={activity.id}
                activity={activity}
                value={(day.values[activity.id] ?? {}) as NoteValue}
                onChange={(v) => setValue(activity.id, v)}
              />
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
}
