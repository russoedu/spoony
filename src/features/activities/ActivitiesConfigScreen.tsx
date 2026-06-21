import { useMemo, useState } from 'react';
import {
  Affix,
  Button,
  Card,
  Collapse,
  Container,
  Divider,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconPlus,
  IconRestore,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/useStore';
import { ActivityIcon } from '@/components/ActivityIcon';
import { activityLabel } from '@/providers/i18n';
import type { Activity, ActivityType } from '@/types';
import { groupActivities, type GroupId } from '@/lib/activityGroups';
import { SortableActivityRow } from './SortableActivityRow';

const LEGEND_TYPES: ActivityType[] = ['wakeup', 'takes', 'gives', 'numeric', 'note'];

export function ActivitiesConfigScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const config = useStore((s) => s.config);
  const setActivities = useStore((s) => s.setActivities);
  const updateActivity = useStore((s) => s.updateActivity);
  const removeActivity = useStore((s) => s.removeActivity);
  const cycleActivityType = useStore((s) => s.cycleActivityType);
  const addActivity = useStore((s) => s.addActivity);
  const restoreDefaultActivities = useStore((s) => s.restoreDefaultActivities);
  const missingDefaultsCount = useStore((s) => s.missingDefaultsCount);
  const [legendOpen, setLegendOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const missingDefaults = missingDefaultsCount();

  const onRestore = () => {
    restoreDefaultActivities();
    notifications.show({ message: t('config.restoreDone'), color: 'spoon' });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } })
  );

  const grouped = useMemo(
    () => groupActivities(config?.activities ?? []),
    [config]
  );

  // Reorder within one group, then rebuild the full list (groups stay contiguous).
  const reorder = (group: Exclude<GroupId, 'wakeup'>) => (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const items = grouped[group];
    const oldIndex = items.findIndex((a) => a.id === active.id);
    const newIndex = items.findIndex((a) => a.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    const full: Activity[] = [
      ...(grouped.wakeup ? [grouped.wakeup] : []),
      ...(group === 'scale' ? next : grouped.scale),
      ...(group === 'activity' ? next : grouped.activity),
      ...(group === 'note' ? next : grouped.note),
    ];
    setActivities(full);
  };

  const wakeupLabel = grouped.wakeup
    ? activityLabel(t, grouped.wakeup.id, grouped.wakeup.label)
    : t('activity.spoons');

  return (
    <Stack gap="md" pb={90}>
      <Group justify="space-between">
        <Title order={3}>{t('config.title')}</Title>
        <Button
          variant="light"
          leftSection={<IconCheck size={16} />}
          onClick={() => navigate('/app/settings')}
        >
          {t('common.done')}
        </Button>
      </Group>

      <Text size="sm" c="dimmed">
        {t('config.instructions')}
      </Text>

      {missingDefaults > 0 && (
        <Button
          variant="default"
          size="xs"
          leftSection={<IconRestore size={14} />}
          onClick={onRestore}
        >
          {t('config.restoreDefaults')}
        </Button>
      )}

      {/* Wake-up spoons: fixed, read-only, always first. */}
      <Card withBorder radius="md" padding="sm" bg="var(--mantine-color-grape-light)">
        <Group gap="xs" wrap="nowrap">
          <ActivityIcon type="wakeup" />
          <Text fw={600} style={{ flex: 1 }}>
            {wakeupLabel}
          </Text>
          <Text size="xs" c="dimmed">
            {t('config.fixed')}
          </Text>
        </Group>
      </Card>

      <Section
        titleKey="config.sectionScale"
        group="scale"
        items={grouped.scale}
        canToggleType={false}
        sensors={sensors}
        onReorder={reorder('scale')}
        onAdd={() => addActivity('scale')}
        onCycleType={cycleActivityType}
        onPatch={updateActivity}
        onRemove={setPendingDelete}
      />
      <Section
        titleKey="config.sectionActivities"
        group="activity"
        items={grouped.activity}
        canToggleType
        sensors={sensors}
        onReorder={reorder('activity')}
        onAdd={() => addActivity('activity')}
        onCycleType={cycleActivityType}
        onPatch={updateActivity}
        onRemove={setPendingDelete}
      />
      <Section
        titleKey="config.sectionNotes"
        group="note"
        items={grouped.note}
        canToggleType={false}
        sensors={sensors}
        onReorder={reorder('note')}
        onAdd={() => addActivity('note')}
        onCycleType={cycleActivityType}
        onPatch={updateActivity}
        onRemove={setPendingDelete}
      />

      {/* Fixed bottom legend with a drawer effect. */}
      <Affix position={{ bottom: 0, left: 0, right: 0 }}>
        <Paper
          withBorder
          radius={0}
          shadow="md"
          style={{ borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }}
        >
          <Container>
            <Group
              justify="space-between"
              px="md"
              py="xs"
              onClick={() => setLegendOpen((o) => !o)}
              style={{ cursor: 'pointer' }}
            >
              <Text fw={600}>{t('config.legendTitle')}</Text>
              {legendOpen ? <IconChevronDown size={18} /> : <IconChevronUp size={18} />}
            </Group>
            <Collapse expanded={legendOpen}>
              <Stack gap={6} px="md" pb="md">
                {LEGEND_TYPES.map((type) => (
                  <Group key={type} gap="xs" wrap="nowrap">
                    <ActivityIcon type={type} />
                    <Text size="sm">{t(`activityType.${type}`)}</Text>
                  </Group>
                ))}
              </Stack>
            </Collapse>
          </Container>
        </Paper>
      </Affix>

      <Modal
        opened={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title={t('config.deleteTitle')}
        centered
      >
        <Stack>
          <Text size="sm">{t('config.deleteWarning')}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setPendingDelete(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (pendingDelete) removeActivity(pendingDelete);
                setPendingDelete(null);
              }}
            >
              {t('common.delete')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

interface SectionProps {
  titleKey: string;
  group: Exclude<GroupId, 'wakeup'>;
  items: Activity[];
  canToggleType: boolean;
  sensors: ReturnType<typeof useSensors>;
  onReorder: (e: DragEndEvent) => void;
  onAdd: () => void;
  onCycleType: (id: string) => void;
  onPatch: (id: string, patch: Partial<Activity>) => void;
  onRemove: (id: string) => void;
}

function Section({
  titleKey,
  items,
  canToggleType,
  sensors,
  onReorder,
  onAdd,
  onCycleType,
  onPatch,
  onRemove,
}: SectionProps) {
  const { t } = useTranslation();
  return (
    <Stack gap="xs">
      <Divider label={t(titleKey)} labelPosition="left" />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onReorder}>
        <SortableContext items={items.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          <Stack gap="xs">
            {items.map((activity) => (
              <SortableActivityRow
                key={activity.id}
                activity={activity}
                canToggleType={canToggleType}
                onCycleType={onCycleType}
                onPatch={onPatch}
                onRemove={onRemove}
              />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>
      <Button variant="light" size="xs" leftSection={<IconPlus size={14} />} onClick={onAdd}>
        {t('config.addItem')}
      </Button>
    </Stack>
  );
}
