import type { TypographyOptions } from '@mui/material/styles/createTypography'
import { hubotSans, monaSans } from './fonts'

const headingVariantKeys = [
  'headingXxl',
  'headingMBold',
  'headingMLight',
  'headingSBold',
  'headingXsBold',
  'headingXsMedium',
] as const

const bodyVariantKeys = [
  'bodyMBold',
  'bodyMRegular',
  'bodySBold',
  'bodySRegular',
  'bodyXsBold',
  'bodyXsRegular',
] as const

const buttonLabelVariantKeys = ['buttonLabelM', 'buttonLabelS', 'buttonLabelXs'] as const

const tableHeaderVariantKeys = ['tableHeaderM', 'tableHeaderS'] as const

const tableCellVariantKeys = [
  'tableCellL',
  'tableCellMBold',
  'tableCellMRegular',
  'tableCellSBold',
  'tableCellSRegular',
] as const

const highlightedVariantKeys = [
  'highLightedXxl',
  'highLightedXl',
  'highLightedL',
  'highLightedM',
  'highLightedS',
  'highLightedXs',
  'highLightedXsNotional',
] as const

export const typographyVariantsKeys = {
  heading: headingVariantKeys,
  body: bodyVariantKeys,
  buttonLabel: buttonLabelVariantKeys,
  table: {
    header: tableHeaderVariantKeys,
    cell: tableCellVariantKeys,
  },
  highlighted: highlightedVariantKeys,
} as const

export const disabledTypographyKeys: (keyof TypographyOptions)[] = [
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

export type TypographyVariantKey =
  | (typeof headingVariantKeys)[number]
  | (typeof bodyVariantKeys)[number]
  | (typeof buttonLabelVariantKeys)[number]
  | (typeof tableHeaderVariantKeys)[number]
  | (typeof tableCellVariantKeys)[number]
  | (typeof highlightedVariantKeys)[number]

export type DisabledTypographyVariantKey = (typeof disabledTypographyKeys)[number]

export type NonTableTypographyVariantKey = Exclude<TypographyVariantKey, `table${string}`>
export type TableTypographyVariantKey = Extract<TypographyVariantKey, `table${string}`>

export type ResolvedTypography = Record<TypographyVariantKey, React.CSSProperties & { description?: string }>

export const FontFamilyBasic = [monaSans.style.fontFamily, '"Helvetica Neue"', 'sans-serif'].join(',')
export const FontFamilyChad = [
  hubotSans.style.fontFamily,
  '"Helvetica Neue"',
  'sans-serif',
  'Minecraft',
  '"SF Mono Regular 11"',
  '"Ubuntu Mono"',
  'monospace',
].join(',')
