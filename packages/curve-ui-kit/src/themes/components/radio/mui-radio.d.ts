import '@mui/material/Radio'

declare module '@mui/material/Radio' {
  export type RadioPropsSizeOverrides = {
    large: true
  }

  export type RadioClasses = {
    sizeLarge: string
  }
}
