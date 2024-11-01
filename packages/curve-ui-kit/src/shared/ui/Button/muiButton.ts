import type { Components, CSSObject } from '@mui/material/styles'
import { extractNumber, type FigmaTokens } from '../../api'
import { basicMuiTheme, omitProperty, type ThemeKey } from '../../lib'

const COLORS = ['primary', 'secondary', 'success', 'alert'] as const
type Color = typeof COLORS[number]

export const defineMuiButton = (figmaTokens: FigmaTokens, mode: ThemeKey): Components['MuiButton'] => {
  const buttonDesktop = figmaTokens.themes.desktop[mode].button
  const buttonMobile = figmaTokens.themes.mobile[mode].button
  const spacingDesktop = figmaTokens.mappedSizesAndSpaces.desktop.spacing
  const spacingMobile = figmaTokens.mappedSizesAndSpaces.mobile.spacing

  const getColorButtonStyle = (color: Color): CSSObject => ({
    backgroundColor: buttonDesktop[color].default?.fill,
    color: buttonDesktop[color].default['label & icon'],
    '&:hover': {
      backgroundColor: buttonDesktop[color].hover.fill,
      color: buttonDesktop[color].hover['label & icon'],
    },
    '&:disabled': {
      backgroundColor: buttonDesktop[color].disabled.fill,
      color: buttonDesktop[color].disabled['label & icon'],
    },
  })

  const getNavigationButtonStyle = (): CSSObject => ({
    color: buttonDesktop.navigation.default['label & icon'],
    '&:hover': {
      backgroundColor: buttonDesktop.navigation.hover.fill,
      color: buttonDesktop.navigation.hover['label & icon'],
    },
    '&:current': {
      backgroundColor: buttonDesktop.navigation.current.fill,
      color: buttonDesktop.navigation.current['label & icon'],
    },
  })

  const getOutlinedButtonStyle = (color: Color): CSSObject => ({
    ...getGhostButtonStyle(color),
    border: `1px solid ${buttonDesktop[color].default?.fill}`,
  })

  const getGhostButtonStyle = (color: Color): CSSObject => ({
    ...getColorButtonStyle(color),
    backgroundColor: 'transparent',
    color: buttonDesktop[color].default?.fill
  })

  return {
    styleOverrides: {
      root: {
        variants: [
          ...COLORS.map((color) => ({ props: { color }, style: getColorButtonStyle(color) })),
          ...COLORS.map((color) => ({ props: { variant: 'ghost', color }, style: getGhostButtonStyle(color) })),
          ...COLORS.map((color) => ({ props: { variant: 'outlined', color }, style: getOutlinedButtonStyle(color) })),
          {
            props: { color: 'navigation' },
            style: getNavigationButtonStyle(),
          },
        ],
        borderRadius: extractNumber(buttonDesktop.radius.md),
      },

      sizeLarge: {
        height: '56px',
        padding: `${spacingDesktop.md}px ${spacingDesktop.sm}px`,
        [basicMuiTheme.breakpoints.down('tablet')]: {
          padding: `${spacingMobile.md}0px ${spacingMobile.sm}0px`,
        },
        ...omitProperty(figmaTokens.typography.buttonLabelM, 'description'),
      },
      sizeMedium: {
        height: '48px',
        padding: `${spacingDesktop.xs}px ${spacingDesktop.sm}px`,
        [basicMuiTheme.breakpoints.down('tablet')]: {
          padding: `${spacingMobile.xs}px ${spacingMobile.sm}px`,
        },
        ...omitProperty(figmaTokens.typography.buttonLabelS, 'description'),
      },
      sizeSmall: {
        height: '40px',
        padding: `${spacingDesktop.xs}px ${spacingDesktop.md}px`,
        [basicMuiTheme.breakpoints.down('tablet')]: {
          padding: `${spacingMobile.xs}px ${spacingMobile.md}px`,
        },
        ...omitProperty(figmaTokens.typography.buttonLabelS, 'description'),
      },
    },
  }
}
