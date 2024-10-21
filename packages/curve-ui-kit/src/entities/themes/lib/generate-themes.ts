import { createTheme as createMuiTheme, type Theme } from '@mui/material/styles'
import { basicMuiTheme, type ThemeKey } from '@/shared/lib/basic-theme'
import { createComponents, createPalette, createSpacing, createTypography } from '../model'

function generateTheme(mode: ThemeKey): Theme {
  const muiTheme = createMuiTheme({
    ...basicMuiTheme,
    palette: createPalette(mode),
    typography: createTypography(mode),
    components: createComponents(mode),
    ...createSpacing(mode),
  })

  return muiTheme
}

export const lightTheme = generateTheme('light')
export const darkTheme = generateTheme('dark')
export const chadTheme = generateTheme('chad')