import '@mui/material/IconButton'

declare module '@mui/material/IconButton' {
  export interface IconButtonPropsSizeOverrides {
    extraExtraSmall: true
    extraSmall: true
  }

  export interface IconButtonClasses {
    sizeExtraExtraSmall: string
    sizeExtraSmall: string
  }
}
