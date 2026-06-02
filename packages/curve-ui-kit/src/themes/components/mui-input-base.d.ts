import '@mui/material/InputBase'
import '@mui/material/InputLabel'
import '@mui/material/TextField'
import type { TextFieldClasses } from '@mui/material'

/**
 * Extend the input base and other inputs that depend on it, so the size is available everywhere we need it.
 * Feel free to add other types of input as needed, as long as they depend on InputBase.
 * Note: The styles only need to be implemented in the input base.
 */
type InputSizeOverrides = {
  tiny: true // called xxs in the design system
  extraLarge: true // called xl in the design system
  // todo: we have a task to create `extraSmall`, called xs in the design system
}

/** Create a class that can be overridden in the theme */
type InputClasses = {
  sizeTiny: string
}

declare module '@mui/material/InputBase' {
  export type InputBasePropsSizeOverrides = {} & InputSizeOverrides
  export type InputBaseClasses = {} & InputClasses
}

declare module '@mui/material/InputLabel' {
  export type InputLabelPropsSizeOverrides = {} & InputSizeOverrides
  export type InputLabelClasses = {} & InputClasses
}

declare module '@mui/material/TextField' {
  export type TextFieldPropsSizeOverrides = {} & TextFieldClasses & InputSizeOverrides
}
