import { useEffect, useState } from 'react';
import { Card, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/useStore';
import { listDayDatesLocal } from '@/lib/storage/db';
import { todayISO } from '@/lib/day';

export function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const setDate = useStore((s) => s.setDate);
  const [logged, setLogged] = useState<string[]>([]);

  useEffect(() => {
    void listDayDatesLocal().then((dates) => setLogged(dates.sort().reverse()));
  }, []);

  const open = async (iso: string) => {
    await setDate(iso);
    navigate('/');
  };

  return (
    <Stack gap="lg" pb={120}>
      <Title order={3}>{t('nav.history')}</Title>

      <Card withBorder radius="md" padding="md">
        <DatePicker
          maxDate={new Date()}
          locale={i18n.language}
          onChange={(value) => {
            if (!value) return;
            void open(dayjs(value as string | Date).format('YYYY-MM-DD'));
          }}
        />
      </Card>

      {logged.length > 0 && (
        <Stack gap="xs">
          {logged.map((iso) => (
            <UnstyledButton key={iso} onClick={() => void open(iso)}>
              <Card withBorder radius="md" padding="sm">
                <Text fw={500}>
                  {iso === todayISO()
                    ? t('common.today')
                    : dayjs(iso).locale(i18n.language).format('ddd, D MMM YYYY')}
                </Text>
              </Card>
            </UnstyledButton>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
