import '@mui/material/Select'

type SelectSizes = 'tiny' | 'small' | 'medium'
type SelectSizeOverrides = { [key in SelectSizes]: true }

declare module '@mui/material/Select' {
  export interface SelectPropsSizeOverrides extends SelectSizeOverrides {}
}
