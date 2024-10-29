import type { ThemeOptions } from '@mui/material'
import { extractPairs, figmaTokens } from '../../../shared/api/figma-tokens'
import type { ThemeKey } from '../../../shared/lib/basic-theme'

export const createPalette = (mode: ThemeKey): ThemeOptions['palette'] => {
  const theme = figmaTokens.themes.desktop[mode]

  return {
    mode: mode === 'dark' ? 'dark' : 'light',
    neutral: {
      ...extractPairs(theme.color.neutral),
      main: theme.color.neutral['500'],
      light: theme.color.neutral['300'],
      dark: theme.color.neutral['700'],
    },
    primary: {
      ...extractPairs(theme.color.primary),
      main: theme.color.primary['500'],
      light: theme.color.primary['300'],
      dark: theme.color.primary['700'],
      contrastText: theme.text.textcolors.primary,
    },
    secondary: {
      ...extractPairs(theme.color.secondary),
      main: theme.color.secondary['500'],
      light: theme.color.secondary['300'],
      dark: theme.color.secondary['700'],
      contrastText: theme.text.textcolors.secondary,
    },
    tertiary: {
      ...extractPairs(theme.color.tertiary),
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
      // TODO: add layer 3 fill, app background, highlight fill
    },
    grey: extractPairs(figmaTokens.primitives.grays),
    green: extractPairs(figmaTokens.primitives.greens),
    red: extractPairs(figmaTokens.primitives.reds),
    blue: extractPairs(figmaTokens.primitives.blues),
    violet: extractPairs(figmaTokens.primitives.violet),
  }
}
