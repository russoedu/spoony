import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Brand purple from the logo (#7020D0) expanded into a Mantine scale.
const grape: MantineColorsTuple = [
  '#f4ecff',
  '#e3d4fb',
  '#c4a6f1',
  '#a576e8',
  '#8a4ee0',
  '#7935db',
  '#7020d0', // index 6 — primary brand shade
  '#5f24bd',
  '#551faa',
  '#491897',
];

// Spoon green accent.
const spoon: MantineColorsTuple = [
  '#e9fbef',
  '#d3f3dd',
  '#a6e6bb',
  '#75d896',
  '#4ecd77',
  '#34c764',
  '#22c459',
  '#12ad49',
  '#019a3f',
  '#008533',
];

export const theme = createTheme({
  primaryColor: 'grape',
  primaryShade: { light: 6, dark: 5 },
  colors: { grape, spoon },
  fontFamily:
    "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  headings: {
    fontFamily:
      "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  defaultRadius: 'md',
});
