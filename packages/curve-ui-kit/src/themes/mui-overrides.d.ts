import { DesignSystem } from './design'

declare module '@mui/material/styles' {
  interface Theme {
    design: DesignSystem
  }
  // allow configuration using `createTheme()`
  interface ThemeOptions {
    design?: DesignSystem
  }
}

declare module '@mui/material/Button' {
  type Buttons = Omit<DesignSystem['Button'], 'Focus_Outline'>
  type ButtonColors = {
    [K in keyof Buttons as Lowercase<string & K>]: true
  }

  export interface ButtonPropsColorOverrides extends ButtonColors {
  }
}
