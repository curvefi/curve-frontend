import { type TypographyOptions } from '@mui/material/styles/createTypography'
import { basicMuiTheme, type ThemeKey } from '../basic-theme'
import { FontFamilyMapping } from './fonts'

const disabledTypographyKeys = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'button',
  'body1',
  'body2',
  'caption',
  'overline',
  'subtitle1',
  'subtitle2',
] as const

const themeFontFamily = {
  chad: FontFamilyMapping.Minecraft,
  light: FontFamilyMapping['Mona Sans'],
  dark: FontFamilyMapping['Mona Sans'],
}

export const TYPOGRAPHY_VARIANTS = {
  headingXxl: {
    fontSize: '64px',
    fontWeight: 700,
    letterSpacing: '-2.56px',
    lineHeight: '64px',
  },
  headingMRegular: {
    fontSize: '32px',
    fontWeight: 700,
    letterSpacing: '-1.28px',
    lineHeight: '36px',
    textTransform: 'uppercase',
  },
  headingMLight: {
    fontSize: '32px',
    fontWeight: 400,
    letterSpacing: '-1.28px',
    lineHeight: '36px',
    textTransform: 'uppercase',
  },
  headingSLight: {
    fontSize: '24px',
    fontWeight: 700,
    letterSpacing: '-0.48px',
    lineHeight: '28px',
    textTransform: 'uppercase',
  },
  headingXsBold: {
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: '16px',
    textTransform: 'uppercase',
  },
  headingXs: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '16px',
    textTransform: 'capitalize',
  },
  bodyMRegular: {
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px',
  },
  bodyMBold: {
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: '24px',
  },
  bodySRegular: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '16px',
  },
  bodySBold: {
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: '16px',
  },
  bodyXsRegular: {
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: '14px',
  },
  bodyXsBold: {
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: '14px',
  },
  buttonLabelXs: {
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: '16px',
  },
  buttonLabelS: {
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: '24px',
    textTransform: 'uppercase',
  },
  buttonLabelM: {
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: '40',
    textTransform: 'uppercase',
  },
  tableHeaderM: {
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '16px',
  },
  tableHeaderS: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '14px',
  },
  tableCellL: {
    fontSize: '20',
    fontWeight: 700,
    lineHeight: '20',
  },
  tableCellsMRegular: {
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '16px',
  },
  tableCellsMBold: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '16px',
  },
  tableCellsSRegular: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '14px',
  },
  tableCellsSBold: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '14px',
  },
  valueXsNotional: {
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: '14px',
  },
  valueXs: {
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: '14px',
  },
  valueS: {
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: '16px',
  },
  valueM: {
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: '16px',
  },
  valueL: {
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: '24px',
  },
  valueXl: {
    fontSize: '32px',
    fontWeight: 700,
    letterSpacing: '-1.28px',
    lineHeight: '36px',
  },
  valueXxl: {
    fontSize: '64px',
    fontWeight: 700,
    letterSpacing: '-2.56px',
    lineHeight: '64px',
  },
} as const

export const createTypography = (mode: ThemeKey): TypographyOptions => {
  const fontFamily = themeFontFamily[mode]
  const disabledTypographyVariants = disabledTypographyKeys.reduce(
    (acc, variant) => ({ ...acc, [variant]: undefined }),
    {} as TypographyOptions,
  )

  const variants = Object.fromEntries(
    Object.entries(TYPOGRAPHY_VARIANTS).map(([key, value]) => [key, { ...value, fontFamily }]),
  )
  return {
    fontFamily,
    fontWeightBold: 700,
    fontWeightMedium: 600,
    fontWeightRegular: 500,
    fontWeightLight: 400,
    fontSize: 16,
    [basicMuiTheme.breakpoints.down('tablet')]: {
      fontSize: 12,
    },
    ...disabledTypographyVariants,
    ...variants,
  } as TypographyOptions
}

export type DisabledTypographyVariantKey = (typeof disabledTypographyKeys)
export type TypographyVariantKey = keyof typeof TYPOGRAPHY_VARIANTS
