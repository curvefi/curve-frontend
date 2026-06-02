import '@mui/material/IconButton'
import { DesignSystem } from '../../design'

declare module '@mui/material/IconButton' {
  type Buttons = Omit<DesignSystem['Button'], 'Focus_Outline' | 'Transition'>
  type ButtonColors = {
    [K in keyof Buttons as Lowercase<string & K>]: true
  }

  export type IconButtonPropsColorOverrides = {} & ButtonColors

  export type IconButtonPropsSizeOverrides = {
    extraExtraSmall: true
    extraSmall: true
  }

  export type IconButtonClasses = {
    sizeExtraExtraSmall: string
    sizeExtraSmall: string
  }
}
