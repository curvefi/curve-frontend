/* eslint-disable @typescript-eslint/no-empty-object-type */
import '@mui/material/InputBase'
import '@mui/material/InputLabel'
import '@mui/material/TextField'
import type { TextFieldClasses } from '@mui/material'

/**
 * Extend the input base and other inputs that depend on it, so the size is available everywhere we need it.
 * Feel free to add other types of input as needed, as long as they depend on InputBase.
 * Note: The styles only need to be implemented in the input base.
 */
interface InputSizeOverrides {
  tiny: true // called xxs in the design system
  // todo: we have a task to create `extraSmall`, called xs in the design system
}

/** Create a class that can be overridden in the theme */
interface InputClasses {
  sizeTiny: string
}

declare module '@mui/material/InputBase' {
  export interface InputBasePropsSizeOverrides extends InputSizeOverrides {}
  export interface InputBaseClasses extends InputClasses {}
}

declare module '@mui/material/InputLabel' {
  export interface InputLabelPropsSizeOverrides extends InputSizeOverrides {}
  export interface InputLabelClasses extends InputClasses {}
}

declare module '@mui/material/TextField' {
  export interface TextFieldPropsSizeOverrides extends TextFieldClasses {}
  export interface TextFieldPropsSizeOverrides extends InputSizeOverrides {}
}
