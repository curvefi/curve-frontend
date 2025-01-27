import { DesignSystem, DesignOptions } from './design'

declare module '@mui/material/styles' {
  interface Theme {
    design: DesignSystem & { options: DesignOptions }
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

declare module '@mui/material/CardHeader' {
  interface CardHeaderPropsVariantOverrides {
    size?: true
  }
}
