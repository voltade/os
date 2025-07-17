import { createTheme, type MantineThemeOverride } from '@mantine/core';

/**
 * Custom theme for Voltade apps.
 * @see https://www.notion.so/voltade/VoltadeOS-App-Design-Checklist-20d05128eddc804dbc17ff85ddef774d
 */
const theme: MantineThemeOverride = createTheme({
  colors: {
    gray: [
      '#f8f9fa', // 0
      '#f1f3f4', // 1
      '#e9ecef', // 2 - fallback/default Mantine
      '#dee2e6', // 3
      '#ced4da', // 4
      '#adb5bd', // 5 - fallback
      '#868e96', // 6
      '#495057', // 7
      '#343a40', // 8
      '#212529', // 9 - fallback
    ],
    blue: [
      '#e7f5ff', // 0
      '#d0ebff', // 1
      '#a5d8ff', // 2 - fallback
      '#74c0fc', // 3 - fallback
      '#339af0', // 4
      '#228be6', // 5 - fallback
      '#1c7ed6', // 6
      '#1971c2', // 7
      '#1864ab', // 8
      '#0b4f9c', // 9 - fallback
    ],
    green: [
      '#d3f9d8',
      '#b2f2bb',
      '#8ce99a',
      '#69db7c',
      '#51cf66',
      '#40c057',
      '#37b24d',
      '#2f9e44',
      '#2b8a3e',
      '#237032',
    ],
    red: [
      '#ffe0e1',
      '#ffc9c9',
      '#ffa8a8',
      '#ff8787',
      '#f03e3e',
      '#e03131',
      '#c92a2a',
      '#b02525',
      '#862e2e',
      '#641e1e',
    ],
    orange: [
      '#fff4e6',
      '#ffe8cc',
      '#ffd8a8',
      '#ffc078',
      '#fd7e14',
      '#f76707',
      '#d9480f',
      '#c03805',
      '#b65700',
      '#933c00',
    ],
  },

  cursorType: 'pointer',
  defaultRadius: 'md',

  fontFamily: 'Inter, sans-serif',
  fontSizes: {
    xs: '10px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
    display: '48px',
  },

  headings: {
    fontFamily: 'Inter, sans-serif',
    sizes: {
      h1: { fontSize: '32px', fontWeight: '700' },
      h2: { fontSize: '24px', fontWeight: '700' },
      h3: { fontSize: '20px', fontWeight: '700' },
      h4: { fontSize: '16px', fontWeight: '500' },
    },
  },

  primaryColor: 'blue',
  primaryShade: 6, // sets blue.6 as the main primary color
});

export default theme;
