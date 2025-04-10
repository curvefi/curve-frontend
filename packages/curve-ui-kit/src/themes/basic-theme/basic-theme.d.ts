import type { DesignOptions, DesignSystem } from '../design'
import type { ThemeKey } from './basic-theme'

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: false
    sm: false
    md: false
    lg: false
    xl: false
    mobile: true
    tablet: true
    desktop: true
  }

  interface Theme {
    design: DesignSystem & { options: DesignOptions }
    key: ThemeKey
  }
  // allow configuration using `createTheme()`
  interface ThemeOptions {
    design?: DesignSystem & { options: DesignOptions }
    key?: ThemeKey
  }

  interface TypeText {
    tertiary: string
    highlight: string
  }
}
