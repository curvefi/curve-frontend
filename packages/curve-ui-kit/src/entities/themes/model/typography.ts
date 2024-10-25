import { type TypographyOptions } from '@mui/material/styles/createTypography'
import { figmaTokens } from '@/shared/api/figma-tokens'
import { basicMuiTheme, ThemeFontFamily, type ThemeKey } from '@/shared/lib/basic-theme'
import { omitProperty } from '@/shared/lib/object-properties'
import { disabledTypographyKeys } from '@/shared/ui/Typography'

export const createTypography = (mode: ThemeKey): TypographyOptions => {
  const typographyVariants = Object.entries(figmaTokens.typography).reduce((acc, [key, value]) => {
    acc[key as keyof typeof figmaTokens.typography] = omitProperty(value, 'description')
    return acc
  }, {} as TypographyOptions)

  const disabledTypographyVariants = disabledTypographyKeys.reduce((acc, variant) => {
    acc[variant] = undefined
    return acc
  }, {} as TypographyOptions)

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
  }
}
