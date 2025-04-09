import '@mui/material/IconButton'

declare module '@mui/material/IconButton' {
  export interface IconButtonPropsSizeOverrides {
    extraSmall: true
  }

  export interface IconButtonClasses {
    sizeExtraSmall: string
  }
}
