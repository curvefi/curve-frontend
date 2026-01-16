/* eslint-disable @typescript-eslint/no-empty-object-type */
import '@mui/material/IconButton'
import { DesignSystem } from '../../design'

declare module '@mui/material/IconButton' {
  type Buttons = Omit<DesignSystem['Button'], 'Focus_Outline' | 'Transition'>
  type ButtonColors = {
    [K in keyof Buttons as Lowercase<string & K>]: true
  }

  export interface IconButtonPropsColorOverrides extends ButtonColors {}

  export interface IconButtonPropsSizeOverrides {
    extraExtraSmall: true
    extraSmall: true
  }

  export interface IconButtonClasses {
    sizeExtraExtraSmall: string
    sizeExtraSmall: string
  }
}
