import '@mui/material/Chip'

export type ChipColors = 'active' | 'alert' | 'default' | 'highlight' | 'warning' | 'accent' | 'selected' | 'unselected'
type DisabledChipColors = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'

type NewChipColorOverrides = { [key in ChipColors]: true }
type DisabledChipColorsOverrides = { [key in DisabledChipColors]: false }

type ChipSizes = 'extraSmall' | 'small' | 'medium' | 'large' | 'extraLarge'
type ChipSizeOverrides = { [key in ChipSizes]: true }

declare module '@mui/material/Chip' {
  export interface ChipPropsColorOverrides extends NewChipColorOverrides, DisabledChipColorsOverrides {}

  export interface ChipPropsSizeOverrides extends ChipSizeOverrides {}

  export interface ChipPropsVariantOverrides {
    filled: false
    outlined: false
  }
}
