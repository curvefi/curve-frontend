import { createTheme as createMuiTheme, type Shadows, type Theme } from '@mui/material/styles'
import { basicMuiTheme, type ThemeKey } from './basic-theme'
import { createPalette } from './palette'
import { createTypography } from './typography'
import { createComponents } from './components'
import { DesignSystem, DesignOptions } from './design'

const paletteMode = (theme: ThemeKey, options: DesignOptions) =>
  options.inverted ? (theme == 'dark' ? 'light' : 'dark') : theme == 'chad' ? 'light' : theme

const generateTheme = (theme: ThemeKey, options: DesignOptions = {}): Theme => {
  const design = DesignSystem[theme](options)
  return createMuiTheme({
    ...basicMuiTheme,
    design: { ...design, options },
    palette: createPalette(paletteMode(theme, options), design),
    typography: createTypography(design),
    components: createComponents(design),
    shape: { borderRadius: 0 },
    cssVariables: true,
    shadows: Array(25).fill('none') as Shadows,
  })
}

export const lightTheme = (options?: DesignOptions) => generateTheme('light', options)
export const darkTheme = (options?: DesignOptions) => generateTheme('dark', options)
export const chadTheme = (options?: DesignOptions) => generateTheme('chad', options)
