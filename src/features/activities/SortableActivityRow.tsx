import { ActionIcon, Card, Collapse, Group, NumberInput, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconChevronDown,
  IconChevronUp,
  IconGripVertical,
  IconTrash,
} from '@tabler/icons-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import type { Activity } from '@/types';
import { ActivityIcon } from '@/components/ActivityIcon';
import { activityLabel } from '@/providers/i18n';

interface Props {
  activity: Activity;
  onCycleType: (id: string) => void;
  onPatch: (id: string, patch: Partial<Activity>) => void;
  onRemove: (id: string) => void;
}

function toNumber(v: number | string): number | undefined {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

export function SortableActivityRow({ activity, onCycleType, onPatch, onRemove }: Props) {
  const { t } = useTranslation();
  const [open, { toggle }] = useDisclosure(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const defaultLabel = activityLabel(t, activity.id, undefined);
  const hasDefaults =
    activity.type === 'takes' || activity.type === 'gives' || activity.type === 'wakeup';
  const expandable = hasDefaults || activity.type === 'numeric';

  return (
    <Card ref={setNodeRef} style={style} withBorder padding="xs" radius="md">
      <Group gap="xs" wrap="nowrap">
        <ActionIcon
          variant="subtle"
          aria-label={t('config.typeHint')}
          title={t(`activityType.${activity.type}`)}
          onClick={() => onCycleType(activity.id)}
        >
          <ActivityIcon type={activity.type} />
        </ActionIcon>

        <TextInput
          style={{ flex: 1 }}
          variant="unstyled"
          placeholder={defaultLabel}
          value={activity.label ?? ''}
          onChange={(e) => onPatch(activity.id, { label: e.currentTarget.value })}
        />

        {expandable && (
          <ActionIcon variant="subtle" color="gray" aria-label="options" onClick={toggle}>
            {open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </ActionIcon>
        )}

        <ActionIcon
          variant="subtle"
          color="red"
          aria-label={t('common.delete')}
          onClick={() => onRemove(activity.id)}
        >
          <IconTrash size={16} />
        </ActionIcon>

        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="drag to reorder"
          style={{ cursor: 'grab', touchAction: 'none' }}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical size={18} />
        </ActionIcon>
      </Group>

      {expandable && (
        <Collapse expanded={open}>
          <Group grow mt="xs" px={4}>
            {hasDefaults && (
              <>
                <NumberInput
                  size="xs"
                  label={t('config.defaultEstimated')}
                  min={0}
                  value={activity.defaultEstimated ?? ''}
                  onChange={(v) => onPatch(activity.id, { defaultEstimated: toNumber(v) })}
                />
                <NumberInput
                  size="xs"
                  label={t('config.defaultUsed')}
                  min={0}
                  value={activity.defaultUsed ?? ''}
                  onChange={(v) => onPatch(activity.id, { defaultUsed: toNumber(v) })}
                />
              </>
            )}
            {activity.type === 'numeric' && (
              <NumberInput
                size="xs"
                label={t('config.scaleMax')}
                min={1}
                value={activity.numericMax ?? 10}
                onChange={(v) => onPatch(activity.id, { numericMax: toNumber(v) ?? 10 })}
              />
            )}
          </Group>
        </Collapse>
      )}
    </Card>
  );
}
