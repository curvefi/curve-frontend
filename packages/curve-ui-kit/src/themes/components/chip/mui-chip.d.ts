/* eslint-disable @typescript-eslint/no-empty-object-type */
// eslint-disable-next-line no-restricted-imports
import '@mui/material/Chip'
import { ChipColors } from './colors'

type DisabledChipColors = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'

type NewChipColorOverrides = { [key in ChipColors]: true }
type DisabledChipColorsOverrides = { [key in DisabledChipColors]: false }

type ChipSizes = 'extraSmall' | 'small' | 'medium' | 'large' | 'extraLarge'
type ChipSizeOverrides = { [key in ChipSizes]: true }

declare module '@mui/material/Chip' {
  export interface ChipPropsColorOverrides extends NewChipColorOverrides, DisabledChipColorsOverrides {}

  export interface ChipPropsSizeOverrides extends ChipSizeOverrides {}

  /** The "outlined" variant is disabled on purpuse because it overrides the custom style of the Chips in the mui-chips.ts file  */
  export interface ChipPropsVariantOverrides {
    filled: false
    outlined: false
    ghost: true
  }
}
