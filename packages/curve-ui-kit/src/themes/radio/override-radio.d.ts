import '@mui/material/Radio'

declare module '@mui/material/Radio' {
  export interface RadioPropsSizeOverrides {
    large: true
  }

  export interface RadioClasses {
    sizeLarge: string
  }
}
