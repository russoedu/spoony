import { useState } from 'react';
import {
  ActionIcon,
  Avatar,
  Button,
  Divider,
  Group,
  Modal,
  Select,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core';
import {
  IconChevronRight,
  IconDownload,
  IconList,
  IconLogout,
  IconShare,
  IconTrash,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/useStore';
import { SUPPORTED_LANGUAGES } from '@/providers/i18n';
import type { ThemePreference } from '@/types';
import { downloadExport } from './exportData';

export function SettingsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const config = useStore((s) => s.config);
  const setTheme = useStore((s) => s.setTheme);
  const setLanguage = useStore((s) => s.setLanguage);
  const signOut = useStore((s) => s.signOut);
  const deleteAllData = useStore((s) => s.deleteAllData);
  const [info, setInfo] = useState<'about' | 'privacy' | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);

  const theme = config?.settings.theme ?? 'system';
  const language = config?.settings.language ?? 'en';

  const onExport = async () => {
    await downloadExport();
    notifications.show({ message: t('settings.exportDone'), color: 'spoon' });
  };

  const onShare = async () => {
    const shareData = {
      title: 'Spoony',
      text: t('settings.shareText'),
      url: 'https://spoony.web.app',
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        notifications.show({ message: shareData.url, color: 'grape' });
      }
    } catch {
      // user cancelled the share sheet — ignore
    }
  };

  const canDelete = !!user && confirmEmail.trim().toLowerCase() === user.email.toLowerCase();

  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteAllData();
      setDeleteOpen(false);
      setConfirmEmail('');
      notifications.show({ message: t('settings.deleteDone'), color: 'grape' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Stack gap="xs" pb={120}>
      <Title order={3}>{t('settings.title')}</Title>

      {user && (
        <Group mt="xs" mb="sm">
          <Avatar src={user.picture} radius="xl" />
          <div>
            <Text fw={500}>{user.name}</Text>
            <Text size="xs" c="dimmed">
              {user.email}
            </Text>
          </div>
        </Group>
      )}

      <Divider />

      <Row
        icon={<IconList size={20} />}
        label={t('settings.editActivities')}
        onClick={() => navigate('/settings/activities')}
      />

      <Row icon={<IconDownload size={20} />} label={t('settings.exportData')} onClick={() => void onExport()} />

      <Row icon={<IconShare size={20} />} label={t('settings.share')} onClick={() => void onShare()} />

      <Divider />

      <Group justify="space-between" py="xs">
        <Text c="dimmed">
          {t('settings.reports')}{' '}
          <Text span fs="italic" size="sm">
            ({t('settings.reportsFuture')})
          </Text>
        </Text>
      </Group>

      <Divider />

      <Group justify="space-between" py="xs" wrap="nowrap">
        <Text>{t('settings.theme')}</Text>
        <SegmentedControl
          size="xs"
          value={theme}
          onChange={(v) => setTheme(v as ThemePreference)}
          data={[
            { label: t('settings.themeLight'), value: 'light' },
            { label: t('settings.themeDark'), value: 'dark' },
            { label: t('settings.themeSystem'), value: 'system' },
          ]}
        />
      </Group>

      <Group justify="space-between" py="xs" wrap="nowrap">
        <Text>{t('settings.language')}</Text>
        <Select
          size="xs"
          w={150}
          allowDeselect={false}
          value={language}
          onChange={(v) => v && setLanguage(v)}
          data={SUPPORTED_LANGUAGES.map((lng) => ({ value: lng, label: t(`language.${lng}`) }))}
        />
      </Group>

      <Divider />

      <Row label={t('settings.privacy')} onClick={() => setInfo('privacy')} />
      <Row label={t('settings.about')} onClick={() => setInfo('about')} />

      <Divider />

      <Group justify="space-between" mt="sm">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconLogout size={18} />}
          onClick={signOut}
        >
          {t('auth.signOut')}
        </Button>
        <Button
          variant="subtle"
          color="red"
          leftSection={<IconTrash size={18} />}
          onClick={() => setDeleteOpen(true)}
        >
          {t('settings.deleteAccount')}
        </Button>
      </Group>

      <Modal opened={info !== null} onClose={() => setInfo(null)} title={info ? t(`${info}.title`) : ''}>
        <Text size="sm">{info ? t(`${info}.body`) : ''}</Text>
      </Modal>

      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('settings.deleteTitle')}
        centered
      >
        <Stack>
          <Text size="sm">{t('settings.deleteBody')}</Text>
          <TextInput
            label={t('settings.deleteConfirmLabel')}
            placeholder={user?.email}
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.currentTarget.value)}
            autoComplete="off"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button color="red" disabled={!canDelete} loading={deleting} onClick={() => void onDelete()}>
              {t('settings.deleteButton')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

function Row({ icon, label, onClick }: { icon?: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <UnstyledButton onClick={onClick} py="sm">
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          {icon}
          <Text>{label}</Text>
        </Group>
        <ActionIcon component="div" variant="subtle" color="gray" aria-hidden>
          <IconChevronRight size={18} />
        </ActionIcon>
      </Group>
    </UnstyledButton>
  );
}
