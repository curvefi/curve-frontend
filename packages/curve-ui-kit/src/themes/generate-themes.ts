import { createTheme as createMuiTheme, type Shadows, type Theme } from '@mui/material/styles'
import { basicMuiTheme, type ThemeKey } from './basic-theme'
import { createPalette } from './palette'
import { createTypography } from './typography'
import { createComponents } from './components'
import { DesignSystem, PaletteVariants } from './design'

const paletteMode = (theme: ThemeKey, options: PaletteVariants) =>
  options.inverted ? (theme == 'dark' ? 'light' : 'dark') : theme == 'chad' ? 'light' : theme

const generateTheme = (theme: ThemeKey, options: PaletteVariants = {}): Theme => {
  const design = DesignSystem[theme](options)
  return createMuiTheme({
    ...basicMuiTheme,
    design,
    palette: createPalette(paletteMode(theme, options), design),
    typography: createTypography(design),
    components: createComponents(design),
    shape: { borderRadius: 0 },
    cssVariables: true,
    shadows: Array(25).fill('none') as Shadows,
  })
}

export const lightTheme = generateTheme('light')
export const darkTheme = generateTheme('dark')
export const chadTheme = generateTheme('chad')
