import { type TypographyOptions } from '@mui/material/styles/createTypography'
import { figmaTokens } from '../../../shared/api/figma-tokens'
import { basicMuiTheme, ThemeFontFamily, type ThemeKey } from '../../../shared/lib/basic-theme'
import { omitProperty } from '../../../shared/lib/object-properties'
import { disabledTypographyKeys } from '../../../shared/ui/Typography'

export const createTypography = (mode: ThemeKey): TypographyOptions => {
  const typographyVariants = Object.entries(figmaTokens.typography).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: omitProperty(value, 'description')
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
