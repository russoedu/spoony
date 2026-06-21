import { useMemo, useState } from 'react';
import { ActionIcon, Button, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconCheck, IconPlus } from '@tabler/icons-react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/useStore';
import { ActivityIcon } from '@/components/ActivityIcon';
import type { ActivityType } from '@/types';
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

  const [newLabel, setNewLabel] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } })
  );

  const sorted = useMemo(
    () => [...(config?.activities ?? [])].sort((a, b) => a.order - b.order),
    [config]
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((a) => a.id === active.id);
    const newIndex = sorted.findIndex((a) => a.id === over.id);
    setActivities(arrayMove(sorted, oldIndex, newIndex));
  };

  const addItem = () => {
    addActivity('takes');
    if (newLabel.trim()) {
      // The new activity is the last one; set its label.
      const last = useStore.getState().config?.activities.at(-1);
      if (last) updateActivity(last.id, { label: newLabel.trim() });
    }
    setNewLabel('');
  };

  return (
    <Stack gap="md" pb={120}>
      <Group justify="space-between">
        <Title order={3}>{t('config.title')}</Title>
        <Button variant="subtle" leftSection={<IconCheck size={16} />} onClick={() => navigate('/settings')}>
          {t('common.done')}
        </Button>
      </Group>

      <Text size="sm" c="dimmed">
        {t('config.instructions')}
      </Text>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sorted.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          <Stack gap="xs">
            {sorted.map((activity) => (
              <SortableActivityRow
                key={activity.id}
                activity={activity}
                onCycleType={cycleActivityType}
                onPatch={updateActivity}
                onRemove={removeActivity}
              />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>

      <Group gap="xs" wrap="nowrap">
        <TextInput
          style={{ flex: 1 }}
          placeholder={t('config.addItem')}
          value={newLabel}
          onChange={(e) => setNewLabel(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <ActionIcon size="lg" aria-label={t('common.add')} onClick={addItem}>
          <IconPlus />
        </ActionIcon>
      </Group>

      <Stack gap={6} mt="md">
        <Text fw={600}>{t('config.legendTitle')}</Text>
        {LEGEND_TYPES.map((type) => (
          <Group key={type} gap="xs" wrap="nowrap">
            <ActivityIcon type={type} />
            <Text size="sm">{t(`activityType.${type}`)}</Text>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
}
