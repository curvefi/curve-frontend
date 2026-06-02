/* eslint-disable @typescript-eslint/no-empty-object-type,@typescript-eslint/consistent-type-definitions */
// eslint-disable-next-line no-restricted-imports
import '@mui/material/Chip'
import { ChipColors } from './colors'

type DisabledChipColors = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'

type NewChipColorOverrides = Record<ChipColors, true>
type DisabledChipColorsOverrides = Record<DisabledChipColors, false>

type ChipSizes = 'extraSmall' | 'small' | 'medium' | 'large' | 'extraLarge'
type ChipSizeOverrides = Record<ChipSizes, true>

declare module '@mui/material/Chip' {
  export interface ChipPropsColorOverrides extends NewChipColorOverrides, DisabledChipColorsOverrides {}

  export interface ChipPropsSizeOverrides extends ChipSizeOverrides {}

  /** The "outlined" variant is disabled on purpose because it overrides the custom style of the Chips in the mui-chips.ts file  */
  export interface ChipPropsVariantOverrides {
    filled: false
    outlined: false
    ghost: true
  }
}
