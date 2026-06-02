import '@mui/material/Button'
import { DesignSystem } from '../../design'

declare module '@mui/material/Button' {
  type Buttons = Omit<DesignSystem['Button'], 'Focus_Outline' | 'Transition'>
  type ButtonColors = {
    [K in keyof Buttons as Lowercase<string & K>]: true
  }

  export type ButtonPropsColorOverrides = {} & ButtonColors

  export type ButtonPropsSizeOverrides = {
    extraSmall: true
  }

  export type ButtonClasses = {
    sizeExtraSmall: string
  }

  export type ButtonPropsVariantOverrides = {
    text: true
    contained: true
    outlined: true
    link: true
    inline: true
  }
}
