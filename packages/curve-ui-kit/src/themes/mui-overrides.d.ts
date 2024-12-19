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

declare module '@mui/material/Button' {
  type Buttons = Omit<DesignSystem['Button'], 'Focus_Outline'>
  type ButtonColors = {
    [K in keyof Buttons as Lowercase<string & K>]: true
  }

  export interface ButtonPropsColorOverrides extends ButtonColors {}

  export interface ButtonPropsSizeOverrides {
    extraSmall: true
  }

  export interface ButtonClasses {
    sizeExtraSmall: string
  }

  export interface ButtonPropsVariantOverrides {
    text: true
    contained: true
    outlined: true
    link: true
  }
}
