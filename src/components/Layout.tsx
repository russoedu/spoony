import { ActionIcon, AppShell, Container, Group, Image } from '@mantine/core';
import { IconCalendar, IconMenu2 } from '@tabler/icons-react';
import { Outlet, useNavigate } from 'react-router-dom';
import { SaveIndicator } from './SaveIndicator';

export function Layout() {
  const navigate = useNavigate();
  return (
    <AppShell
      header={{ height: { base: 64, md: 80 }}}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <button
            onClick={() => navigate('/')}
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
              onClick={() => navigate('/history')}
            >
              <IconCalendar size={22} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="lg"
              aria-label="Menu"
              onClick={() => navigate('/settings')}
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
    </AppShell>
  );
}
