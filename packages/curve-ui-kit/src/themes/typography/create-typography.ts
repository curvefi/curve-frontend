import { type TypographyOptions } from '@mui/material/styles/createTypography'
import { basicMuiTheme, type ThemeKey } from '../basic-theme'
import { FIGMA_TOKENS, FigmaTokens } from '../model'
import { disabledTypographyKeys } from './config'
import { replaceFontName, ThemeFontFamily } from './fonts'

type FigmaTypography = FigmaTokens['typography']
type FigmaTypographyKey = keyof FigmaTypography
export type TypographyVariant = FigmaTypography[FigmaTypographyKey] & { description?: string }
type FigmaTypographyVariants = Record<FigmaTypographyKey, TypographyVariant>

export const createTypography = (mode: ThemeKey): TypographyOptions => {
  const typographyVariants = Object.entries(FIGMA_TOKENS.typography as FigmaTypographyVariants).reduce((acc, [key, { description, ...styles }]) => ({
    ...acc,
    [key]: replaceFontName(styles)
  }), {} as TypographyOptions)

  const disabledTypographyVariants = disabledTypographyKeys.reduce((acc, variant) => ({ ...acc, [variant]: undefined }), {} as TypographyOptions)
  return {
    fontFamily: ThemeFontFamily[mode],
    fontWeightBold: 700,
    fontWeightMedium: 600,
    fontWeightRegular: 500,
    fontWeightLight: 400,
    fontSize: 16,
    [basicMuiTheme.breakpoints.down('tablet')]: {
      fontSize: 12,
    },

    ...disabledTypographyVariants,
    ...typographyVariants,
  } as TypographyOptions
}