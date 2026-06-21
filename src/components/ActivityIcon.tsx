import {
  IconGauge,
  IconLetterT,
  IconSparkles,
  IconTriangleFilled,
  IconTriangleInvertedFilled,
} from '@tabler/icons-react';
import type { ActivityType } from '@/types';

interface Props {
  type: ActivityType;
  size?: number;
}

/** Type glyphs matching the configurator legend:
 *  wakeup = spoons you woke up with, takes (red), gives (green), numeric, note. */
export function ActivityIcon({ type, size = 18 }: Props) {
  switch (type) {
    case 'wakeup':
      return <IconSparkles size={size} color="var(--mantine-color-cyan-5)" />;
    case 'takes':
      return <IconTriangleInvertedFilled size={size} color="var(--mantine-color-red-6)" />;
    case 'gives':
      return <IconTriangleFilled size={size} color="var(--mantine-color-spoon-6)" />;
    case 'numeric':
      return <IconGauge size={size} color="var(--mantine-color-yellow-6)" />;
    case 'note':
      return <IconLetterT size={size} color="var(--mantine-color-grape-5)" />;
  }
}
