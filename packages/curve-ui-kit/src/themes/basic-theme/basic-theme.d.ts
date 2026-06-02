import type { DesignOptions, DesignSystem } from '../design'
import type { ThemeKey } from './basic-theme'

declare module '@mui/material/styles' {
  type BreakpointOverrides = {
    xs: false
    sm: false
    md: false
    lg: false
    xl: false
    mobile: true
    tablet: true
    desktop: true
  }

  type Theme = {
    design: DesignSystem & { options: DesignOptions }
    key: ThemeKey
  }
  // allow configuration using `createTheme()`
  type ThemeOptions = {
    design?: DesignSystem & { options: DesignOptions }
    key?: ThemeKey
  }

  type TypeText = {
    tertiary: string
    highlight: string
  }

  type ZIndex = {
    tableStickyColumn: number
    tableHeader: number
    tableFilters: number
    tableHeaderStickyColumn: number
    tableStickyLastRow: number
  }
}
