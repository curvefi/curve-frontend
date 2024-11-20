import { createTheme as createMuiTheme } from '@mui/material/styles'

export const basicMuiTheme = createMuiTheme({
  breakpoints: {
    keys: ['mobile', 'tablet', 'desktop'] as const,
    values: {
      mobile: 0,
      tablet: 640,
      desktop: 1200,
    },
    unit: 'px',
  },
  spacing: [0, 2, 4, 8, 16, 24, 32, 48],
  direction: 'ltr',
})
