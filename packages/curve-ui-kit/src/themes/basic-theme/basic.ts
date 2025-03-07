import { Breakpoint } from '@mui/material'
import { createTheme as createMuiTheme } from '@mui/material/styles'
import { CSSObject } from '@mui/styled-engine'
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

/**
 * Create a responsive object based on the breakpoints defined in the basicMuiTheme.
 *
 * @example:
 *  handleBreakpoints({ width: 100, height: { mobile: '100px', tablet: '200px', desktop: '300px' } }) => {
 *   '@media (min-width: 0px)': { width: 100, height: '100px' },
 *   '@media (min-width: 640px)': { width: 100, height: '200px' },
 *   '@media (min-width: 1200px)': { width: 100, height: '300px' }
 *  }
 */
export const handleBreakpoints = (values: Record<keyof CSSObject, number | string | Responsive>): CSSObject =>
  Object.fromEntries(
    basicMuiTheme.breakpoints.keys.map((breakpoint) => {
      const selector = basicMuiTheme.breakpoints.up(breakpoint)
      return [
        selector,
        {
          // in case the selector is already present, merge the values
          ...((values[selector] as CSSObject) ?? {}),
          ...Object.fromEntries(
            Object.entries(values).map(([key, value]) => [
              key,
              typeof value === 'string' || typeof value === 'number' || value == null ? value : value[breakpoint],
            ]),
          ),
        },
      ]
    }),
  )

export type Responsive = Record<Breakpoint, string>
