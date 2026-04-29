// eslint-disable-next-line import-x/no-unresolved
import '@mui/material/CheckBox'

declare module '@mui/material/Checkbox' {
  export interface CheckboxPropsSizeOverrides {
    large: true
  }

  export interface CheckboxClasses {
    sizeLarge: string
  }
}
