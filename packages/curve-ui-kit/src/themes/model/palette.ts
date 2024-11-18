import type { ThemeKey } from '../basic-theme'
import { FIGMA_TOKENS } from './figma-tokens.generated'
import type { PaletteOptions } from '@mui/material/styles/createPalette'

export const createPalette = (mode: ThemeKey): PaletteOptions => {
  const theme = FIGMA_TOKENS.themes.desktop[mode]
  return {
    mode: mode === 'dark' ? 'dark' : 'light',
    neutral: {
      ...theme.color.neutral,
      main: theme.color.neutral['500'],
      light: theme.color.neutral['300'],
      dark: theme.color.neutral['700'],
    },
    primary: {
      ...theme.color.primary,
      main: theme.color.primary['500'],
      light: theme.color.primary['300'],
      dark: theme.color.primary['700'],
      contrastText: theme.text.textcolors.primary,
    },
    secondary: {
      ...theme.color.secondary,
      main: theme.color.secondary['500'],
      light: theme.color.secondary['300'],
      dark: theme.color.secondary['700'],
      contrastText: theme.text.textcolors.secondary,
    },
    tertiary: {
      ...theme.color.tertiary,
      main: theme.color.tertiary['400'],
      contrastText: theme.text.textcolors.tertiary,
    },
    error: {
      main: theme.feedback.alert,
      contrastText: theme.text.textcolors.alert,
    },
    warning: {
      main: theme.feedback.warning,
      contrastText: theme.text.textcolors.warning,
    },
    info: {
      main: theme.color.primary['300'],
      contrastText: theme.text.textcolors.primary,
    },
    success: {
      main: theme.feedback.success,
      contrastText: theme.text.textcolors.success,
    },
    text: {
      primary: theme.text.textcolors.primary,
      secondary: theme.text.textcolors.secondary,
      disabled: theme.text.textcolors.disabled,
    },
    background: {
      default: theme.layer['1'].fill,
      paper: theme.layer['2'].fill,
      layer1Fill: theme.layer['1'].fill,
      layer1Outline: theme.layer['1'].outline,
      layer2Fill: theme.layer['2'].fill,
      layer2Outline: theme.layer['2'].outline,
      layer3Fill: theme.layer['3'].fill,
      layer3Outline: theme.layer['3'].outline,
    },
    grey: FIGMA_TOKENS.primitives.grays,
  }
}
