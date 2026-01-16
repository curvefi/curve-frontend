/* eslint-disable @typescript-eslint/no-empty-object-type */
import '@mui/material/Button'
import { DesignSystem } from '../../design'

declare module '@mui/material/Button' {
  type Buttons = Omit<DesignSystem['Button'], 'Focus_Outline' | 'Transition'>
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
    inline: true
  }
}
