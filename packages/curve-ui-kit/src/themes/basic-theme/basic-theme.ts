/// <reference path="./basic-theme.d.ts" />
import { fromEntries, mapRecord } from '@curvefi/primitives/objects.utils'
import { Breakpoint } from '@mui/material'
import { createTheme as createMuiTheme } from '@mui/material/styles'
import { CSSObject } from '@mui/styled-engine'
import { Spacing } from '../design/0_primitives'

export type ThemeKey = 'light' | 'dark' | 'chad'

export const basicMuiTheme = createMuiTheme({
  breakpoints: {
    keys: ['mobile', 'tablet', 'desktop'] as const,
    values: { mobile: 0, tablet: 820, desktop: 1200 },
    unit: 'px',
  },
  spacing: [
    Spacing[0],
    Spacing[100],
    Spacing[200],
    Spacing[300],
    Spacing[350],
    Spacing[400],
    Spacing[500],
    Spacing[600],
    Spacing[700],
    Spacing[800],
  ],
  direction: 'ltr',
  zIndex: {
    tableStickyColumn: 100, // the sticky column in the table
    tableFilters: 110, // the filters in the table header
    tableHeader: 120, // the whole table header including filters
    tableHeaderStickyColumn: 130, // the sticky column in the table header
    tableStickyLastRow: 140, // the last row in the table is sticky so we don't show the header without any data
  },
})

export type Responsive<T = string> = Record<Breakpoint, T>

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
export const handleBreakpoints = (values: {
  [P in keyof CSSObject]: CSSObject[P] | Responsive<CSSObject[P]>
}): CSSObject =>
  fromEntries(
    basicMuiTheme.breakpoints.keys.map((breakpoint) => {
      const selector = basicMuiTheme.breakpoints.up(breakpoint)
      return [
        selector,
        {
          // in case the selector is already present, merge the values
          ...((values[selector] as CSSObject) ?? {}),
          ...mapRecord(values, (_, value) =>
            value && typeof value === 'object' ? (value as Responsive)[breakpoint] : value,
          ),
        },
      ]
    }),
  )

export const mapBreakpoints = (
  values: Responsive,
  callback: (value: string, breakpoint: Breakpoint) => string,
): CSSObject => mapRecord(values, (breakpoint, value) => callback(value, breakpoint))
