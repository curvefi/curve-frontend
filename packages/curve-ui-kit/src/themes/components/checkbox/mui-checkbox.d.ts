// eslint-disable-next-line import-x/no-unresolved
import '@mui/material/CheckBox'

declare module '@mui/material/Checkbox' {
  export type CheckboxPropsSizeOverrides = {
    large: true
  }

  export type CheckboxClasses = {
    sizeLarge: string
  }
}
