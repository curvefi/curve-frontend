import { DesignSystem } from '../design'

declare module '@mui/material/IconButton' {
  export interface IconButtonPropsSizeOverrides {
    extraSmall: true
  }

  export interface IconButtonClasses {
    sizeExtraSmall: string
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

declare module '@mui/material/ToggleButton' {
  export interface ToggleButtonPropsSizeOverrides {
    extraSmall: true
  }

  export interface ToggleButtonClasses {
    sizeExtraSmall: string
    sizeExtraSmallSquare: string
    sizeSmallSquare: string
    sizeMediumSquare: string
  }

  export interface ToggleButtonPropsSizeOverrides {
    extraSmallSquare: true
    smallSquare: true
    mediumSquare: true
  }
}

declare module '@mui/material/ToggleButtonGroup' {
  export interface ToggleButtonGroupProps {
    compact?: boolean
  }

  export interface ToggleButtonGroupPropsSizeOverrides {
    extraSmallSquare: true
    smallSquare: true
    mediumSquare: true
  }
}
