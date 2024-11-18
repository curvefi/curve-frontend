import { createTheme as createMuiTheme, type Shadows, type Theme } from '@mui/material/styles'
import { basicMuiTheme, type ThemeKey } from './basic-theme'
import { createComponents, createPalette, createSpacing } from './model'
import { createTypography } from './typography'

const generateTheme = (mode: ThemeKey): Theme =>
  createMuiTheme({
      ...basicMuiTheme,
      palette: createPalette(mode),
      typography: createTypography(mode),
      components: createComponents(mode),
      ...createSpacing(mode),
      cssVariables: true,
      shadows: Array(25).fill("none") as Shadows,
    })

export const lightTheme = generateTheme('light')
export const darkTheme = generateTheme('dark')
export const chadTheme = generateTheme('chad')
