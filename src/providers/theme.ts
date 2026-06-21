import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Palette from colours.svg:
//   #7020D1 purple (brand) · #1ED151 bright green · #D08720 amber
//   #593C7C muted purple · #35523C deep green · #7CEC9C mint

const grape: MantineColorsTuple = [
  '#f6ecff',
  '#e7d6fb',
  '#caa9f1',
  '#ad79e8',
  '#9551e0',
  '#8638db',
  '#7020d1', // 6 — brand purple
  '#631cbb',
  '#5818a6',
  '#4b1391',
];

// Bright spoon green (#1ED151) — "gives spoons".
const spoon: MantineColorsTuple = [
  '#e6fcef',
  '#d0f7de',
  '#a3efbd',
  '#72e798',
  '#4ce079',
  '#33dc66',
  '#1ed151', // 6
  '#12ba45',
  '#04a539',
  '#008f2d',
];

// Amber (#D08720) — "takes spoons".
const pumpkin: MantineColorsTuple = [
  '#fff8e1',
  '#ffedcc',
  '#f7d59b',
  '#f2bd66',
  '#eea93a',
  '#ec9d20',
  '#d08720', // 6
  '#b27214',
  '#965f0a',
  '#7a4c00',
];

// Muted purple (#593C7C) — numeric scales.
const plum: MantineColorsTuple = [
  '#f3effa',
  '#e0d8ec',
  '#c2b3d9',
  '#a38cc6',
  '#886bb5',
  '#7656ac',
  '#6d4ca8',
  '#5d3f93',
  '#593c7c', // 8
  '#48305f',
];

// Deep green (#35523C) — note fields.
const forest: MantineColorsTuple = [
  '#eef3ef',
  '#dde7e0',
  '#b8ccbf',
  '#92b09c',
  '#72997e',
  '#5e8b6b',
  '#508062',
  '#3f6b50',
  '#35523c', // 8
  '#283f2d',
];

export const theme = createTheme({
  primaryColor: 'grape',
  primaryShade: { light: 6, dark: 5 },
  autoContrast: true,
  luminanceThreshold: 0.4,
  colors: { grape, spoon, pumpkin, plum, forest },
  // Fun brand gradient (purple → spoon green).
  defaultGradient: { from: 'grape.6', to: 'spoon.6', deg: 135 },
  defaultRadius: 'lg',
});
