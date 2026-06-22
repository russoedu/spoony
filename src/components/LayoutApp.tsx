import { ExportLogModal } from '@/features/daily-log/export/ExportLogModal';
import { useStore } from '@/store/useStore';
import { ActionIcon, AppShell, Container, Group, Image } from '@mantine/core';
import { IconCalendar, IconMenu2, IconShare } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SaveIndicator } from './SaveIndicator';

export function LayoutApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const day = useStore((s) => s.currentDay);
  const currentDate = useStore((s) => s.currentDate);
  const config = useStore((s) => s.config);
  const [exportOpen, setExportOpen] = useState(false);

  const onDailyLog = location.pathname === '/app';

  return (
    <AppShell header={{ height: 64 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <button
            onClick={() => navigate('/app')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
            aria-label="Spoony home"
          >
            <Image src="/full-logo.svg" alt="Spoony" h={36} w="auto" fit="contain" />
          </button>
          <Group gap="xs" wrap="nowrap">
            <SaveIndicator />
            <ActionIcon
              variant="subtle"
              size="lg"
              aria-label="History"
              onClick={() => navigate('/app/history')}
            >
              <IconCalendar size={22} />
            </ActionIcon>
            {onDailyLog && day && config && (
              <ActionIcon
                variant="subtle"
                size="lg"
                aria-label="Export"
                onClick={() => setExportOpen(true)}
              >
                <IconShare size={22} />
              </ActionIcon>
            )}
            <ActionIcon
              variant="subtle"
              size="lg"
              aria-label="Menu"
              onClick={() => navigate('/app/settings')}
            >
              <IconMenu2 size={22} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="sm" px={0}>
          <Outlet />
        </Container>
      </AppShell.Main>

      {onDailyLog && day && config && (
        <ExportLogModal
          opened={exportOpen}
          onClose={() => setExportOpen(false)}
          day={day}
          config={config}
          dateLabel={dayjs(currentDate).locale(i18n.language).format('ddd, D MMM YYYY')}
        />
      )}
    </AppShell>
  );
}
