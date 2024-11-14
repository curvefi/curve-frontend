import type { BreakpointsOptions } from '@mui/material'

export const breakpoints: BreakpointsOptions = {
  keys: ['mobile', 'tablet', 'desktop'] as const,
  values: {
    mobile: 0,
    tablet: 640,
    desktop: 1200,
  },
  unit: 'px',
}
