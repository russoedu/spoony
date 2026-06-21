import { Card, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Activity, DayEntry } from '@/types';
import { computeBalance } from '@/lib/spoons';

interface Props {
  day: DayEntry;
  activities: Activity[];
}

export function SpoonBalanceBar({ day, activities }: Props) {
  const { t } = useTranslation();
  const balance = computeBalance(day, activities);

  const left = balance.usedBalance;
  const leftColor = left < 0 ? 'red' : left <= 2 ? 'orange' : 'spoon';

  return (
    <Card
      withBorder
      radius="md"
      padding="sm"
      pos="sticky"
      top={72}
      style={{ zIndex: 2 }}
      bg="var(--mantine-color-grape-light)"
    >
      <Group justify="space-between">
        <Stat label={t('dailyLog.spoonsWokeUp')} value={balance.wakeup} />
        <Stat label={t('dailyLog.balancePlanned')} value={balance.plannedBalance} />
        <Stat label={t('dailyLog.balanceUsed')} value={left} color={leftColor} big />
      </Group>
    </Card>
  );
}

function Stat({
  label,
  value,
  color,
  big,
}: {
  label: string;
  value: number;
  color?: string;
  big?: boolean;
}) {
  return (
    <Stack gap={0} align="center">
      <Text size="xs" c="dimmed" ta="center">
        {label}
      </Text>
      <Text fw={700} fz={big ? 28 : 20} c={color}>
        {value}
      </Text>
    </Stack>
  );
}
