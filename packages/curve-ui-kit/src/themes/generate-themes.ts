import { createTheme as createMuiTheme, type Shadows, type Theme } from '@mui/material/styles'
import { basicMuiTheme, type ThemeKey } from './basic-theme'
import { createPalette } from './palette'
import { createTypography } from './typography'
import { createComponents } from './components'

const generateTheme = (mode: ThemeKey): Theme => {
  const palette = createPalette(mode)
  const typography = createTypography(mode)
  return createMuiTheme({
    ...basicMuiTheme,
    palette,
    typography,
    components: createComponents(palette, typography),
    shape: { borderRadius: 0 },
    cssVariables: true,
    shadows: Array(25).fill('none') as Shadows,
  })
}

export const lightTheme = generateTheme('light')
export const darkTheme = generateTheme('dark')
export const chadTheme = generateTheme('chad')
