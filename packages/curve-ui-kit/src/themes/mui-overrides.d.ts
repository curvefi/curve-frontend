import type { DesignSystem, DesignOptions } from './design'
import type { ThemeKey } from './basic-theme'

declare module '@mui/material/styles' {
  interface Theme {
    design: DesignSystem & { options: DesignOptions }
    key: ThemeKey
  }
  // allow configuration using `createTheme()`
  interface ThemeOptions {
    design?: DesignSystem & { options: DesignOptions }
  }

  interface TypeText {
    tertiary: string
    highlight: string
  }
}
