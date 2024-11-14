import { createTheme as createMuiTheme } from '@mui/material/styles'
import { breakpoints } from './breakpoints'

export const basicMuiTheme = createMuiTheme({
  breakpoints,
  direction: 'ltr',
})
