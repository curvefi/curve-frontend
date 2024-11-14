import type { Components, CSSObject } from '@mui/material/styles'
import { basicMuiTheme, ThemeKey } from '../basic-theme'
import { FigmaTokens } from '../model'
import { replaceFontName } from '../typography/fonts'

const COLORS = ['primary', 'secondary', 'success', 'alert'] as const
type Color = typeof COLORS[number]

export const BUTTONS_HEIGHTS = ['2rem', '2.5rem', '3rem'] as const // 32px, 40px, 48px

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

  const [smallHeight, mediumHeight, largeHeight] = BUTTONS_HEIGHTS

  return {
    styleOverrides: {
      root: {
        variants: [
          // todo: variants shouldn't have colors
          ...COLORS.map((color) => ({ props: { color }, style: getColorButtonStyle(color) })),
          ...COLORS.map((color) => ({ props: { variant: 'ghost', color }, style: getGhostButtonStyle(color) })),
          ...COLORS.map((color) => ({ props: { variant: 'outlined', color }, style: getOutlinedButtonStyle(color) })),
          {
            props: { color: 'navigation' },
            style: getNavigationButtonStyle(),
          },
        ],
        borderRadius: buttonDesktop.radius.md,
      },
      sizeLarge: {
        height: largeHeight,
        padding: `0 ${spacingDesktop.sm}px`,
        [basicMuiTheme.breakpoints.down('tablet')]: { padding: `0 ${spacingMobile.sm}0px` },
        ...replaceFontName(figmaTokens.typography.buttonLabelM),
      },
      sizeMedium: {
        height: mediumHeight,
        padding: `0 ${spacingDesktop.sm}px`,
        [basicMuiTheme.breakpoints.down('tablet')]: { padding: `0 ${spacingMobile.sm}px` },
        ...replaceFontName(figmaTokens.typography.buttonLabelS),
      },
      sizeSmall: {
        height: smallHeight,
        padding: `0 ${spacingDesktop.md}px`,
        [basicMuiTheme.breakpoints.down('tablet')]: { padding: `0 ${spacingMobile.md}px` },
        ...replaceFontName(figmaTokens.typography.buttonLabelS),
      },
    },
  }
}
