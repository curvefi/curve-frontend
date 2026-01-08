/* eslint-disable @typescript-eslint/no-empty-object-type */
import '@mui/material/Select'

type SelectSizes = 'tiny' | 'small' | 'medium'
type SelectSizeOverrides = { [key in SelectSizes]: true }

declare module '@mui/material/Select' {
  export interface SelectPropsSizeOverrides extends SelectSizeOverrides {}
}
