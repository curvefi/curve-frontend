import type { Components, CSSObject } from '@mui/material/styles'
import { type FigmaTokens, extractNumber } from '@/shared/api/figma-tokens'
import { basicMuiTheme, type ThemeKey } from '@/shared/lib/basic-theme'
import { omitProperty } from '@/shared/lib/object-properties'

export const defineMuiButton = (figmaTokens: FigmaTokens, mode: ThemeKey) => {
  const buttonDesktop = figmaTokens.themes.desktop[mode].button
  const buttonMobile = figmaTokens.themes.mobile[mode].button
  const spacingDesktop = figmaTokens.mappedSizesAndSpaces.desktop.spacing
  const spacingMobile = figmaTokens.mappedSizesAndSpaces.mobile.spacing

  const getColorButtonStyle = (color: 'primary' | 'secondary' | 'success' | 'alert'): CSSObject => {
    return {
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
    }
  }

  const getNavigationButtonStyle = (): CSSObject => {
    return {
      color: buttonDesktop.navigation.default['label & icon'],
      '&:hover': {
        backgroundColor: buttonDesktop.navigation.hover.fill,
        color: buttonDesktop.navigation.hover['label & icon'],
      },
      '&:current': {
        backgroundColor: buttonDesktop.navigation.current.fill,
        color: buttonDesktop.navigation.current['label & icon'],
      },
    }
  }

  const getVariantButtonStyle = (variant: 'outlined'): CSSObject => {
    return {
      backgroundColor: 'transparent',
      borderColor: buttonDesktop[variant].default.outline,
      color: buttonDesktop[variant].default['label & icon'],
      '&:hover': {
        borderColor: buttonDesktop[variant].hover.outline,
        color: buttonDesktop[variant].hover['label & icon'],
      },
      '&:disabled': {
        borderColor: buttonDesktop[variant].disabled.outline,
        color: buttonDesktop[variant].disabled['label & icon'],
      },
    }
  }

  const getGhostButtonStyle = (): CSSObject => {
    return {
      backgroundColor: 'transparent',
      color: buttonDesktop.ghost.default['label & icon'],
      '&:hover': {
        backgroundColor: buttonDesktop.ghost.hover.fill,
        color: buttonDesktop.ghost.hover['label & icon'],
      },
      '&:disabled': {
        backgroundColor: buttonDesktop.ghost.disabled.fill,
        color: buttonDesktop.ghost.disabled['label & icon'],
      },
    }
  }

  const muiButton: Components['MuiButton'] = {
    styleOverrides: {
      root: {
        variants: [
          {
            props: { color: 'primary' },
            style: getColorButtonStyle('primary'),
          },
          {
            props: { color: 'secondary' },
            style: getColorButtonStyle('secondary'),
          },
          {
            props: { color: 'success' },
            style: getColorButtonStyle('success'),
          },
          {
            props: { color: 'alert' },
            style: getColorButtonStyle('alert'),
          },
          {
            props: { color: 'navigation' },
            style: getNavigationButtonStyle(),
          },
          {
            props: { variant: 'outlined' },
            style: getVariantButtonStyle('outlined'),
          },
          {
            props: { variant: 'ghost' },
            style: getGhostButtonStyle(),
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

  return muiButton
}
