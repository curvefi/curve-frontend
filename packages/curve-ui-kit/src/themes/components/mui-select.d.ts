/* eslint-disable @typescript-eslint/no-empty-object-type,@typescript-eslint/consistent-type-definitions */
// eslint-disable-next-line no-restricted-imports
import '@mui/material/Select'

type SelectSizes = 'tiny' | 'small' | 'medium' | 'extraLarge'
type SelectSizeOverrides = { [key in SelectSizes]: true }

declare module '@mui/material/Select' {
  export interface SelectPropsSizeOverrides extends SelectSizeOverrides {}
}
