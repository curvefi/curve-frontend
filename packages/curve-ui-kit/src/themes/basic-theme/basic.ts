import { createTheme as createMuiTheme } from '@mui/material/styles'
import { Spacing } from '../design/0_primitives'

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
  spacing: Object.values(Spacing),
  direction: 'ltr',
})
