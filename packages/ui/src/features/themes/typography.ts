import { Breakpoint } from '@mui/material'
import { type TypographyVariantsOptions } from '@mui/material/styles'
import { basicMuiTheme } from './basic-theme'
import { DesignSystem } from './design'
import { Sizing, Spacing, TRANSITION_FUNCTION } from './design/0_primitives'
import { SizesAndSpaces } from './design/1_sizes_spaces'
import { Fonts } from './fonts'

const TABULAR_NUMS = 'tabular-nums'

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

const { LineHeight, FontSize, ButtonSize } = SizesAndSpaces

export type TypographyVariantDefinition = {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  fontSize: string | keyof typeof FontSize
  fontWeight?: keyof DesignSystem['Text']['FontWeight']
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  lineHeight?: string | keyof typeof LineHeight
  letterSpacing?: string
  textCase?: 'uppercase' | 'capitalize'
  fontVariantNumeric?: typeof TABULAR_NUMS
  marginBottom?: number
}

const responsiveValues = (
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  fontSize: string | keyof typeof FontSize,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  lineHeight: string | keyof typeof LineHeight | undefined,
  breakpoint: Breakpoint,
) => ({
  [basicMuiTheme.breakpoints.up(breakpoint)]: {
    fontSize: FontSize[fontSize as keyof typeof FontSize]?.[breakpoint],
    lineHeight: LineHeight[lineHeight as keyof typeof LineHeight]?.[breakpoint],
  },
})

const variant = (
  FontWeight: DesignSystem['Text']['FontWeight'],
  {
    fontSize,
    fontWeight,
    lineHeight = fontSize,
    letterSpacing = '0%',
    textCase,
    fontVariantNumeric,
  }: TypographyVariantDefinition,
) => ({
  fontWeight: FontWeight[fontWeight ?? 'Medium'],
  letterSpacing,
  fontVariantNumeric,
  // Undo the letter spacing to the right of the last letter
  ...(letterSpacing !== '0%' && {
    marginRight: `calc(${letterSpacing} * -1)`,
  }),
  textTransform: textCase ?? 'none',
  transition: `color ${TRANSITION_FUNCTION}, border ${TRANSITION_FUNCTION}`, // border is used in the chip, for example
  ...(!(fontSize in FontSize) && { fontSize }),
  ...(!(lineHeight in LineHeight) && { lineHeight }),
  ...responsiveValues(fontSize, lineHeight, 'mobile'),
  ...responsiveValues(fontSize, lineHeight, 'tablet'),
  ...responsiveValues(fontSize, lineHeight, 'desktop'),
})

// prettier-ignore
export const TYPOGRAPHY_VARIANTS = {
  headingXxl: { fontWeight: 'Extra_Bold', fontSize: 'xxl', letterSpacing: '-2.56px' },
  headingMBold: { fontWeight: 'Bold', fontSize: 'xl', lineHeight: 'lg', letterSpacing: '-1.28px', textCase: 'uppercase' },
  headingMLight: { fontWeight: 'Light', fontSize: 'xl', lineHeight: 'lg', letterSpacing: '-1.28px', textCase: 'uppercase' },
  headingSBold: { fontWeight: 'Bold', fontSize: 'lg', lineHeight: Sizing[300], letterSpacing: '-0.48px', textCase: 'uppercase' },
  headingXsBold: { fontWeight: 'Bold', fontSize: 'sm', textCase: 'uppercase' },
  headingXsMedium: { fontWeight: 'Normal', fontSize: 'sm' },

  bodyMRegular: { fontWeight: 'Medium', fontSize: 'md' },
  bodyMBold: { fontWeight: 'Bold', fontSize: 'md' },
  bodySRegular: { fontSize: 'sm', fontWeight: 'Normal', lineHeight: 'sm' },
  bodySBold: { fontWeight: 'Bold', fontSize: 'sm' },
  bodyXsRegular: { fontWeight: 'Normal', fontSize: 'xs' },
  bodyXsBold: { fontWeight: 'Bold', fontSize: 'xs' },

  buttonXxs: { fontWeight: 'Bold', fontSize: 'xs', lineHeight: 'xs' },
  buttonXs: { fontWeight: 'Normal', fontSize: 'sm', lineHeight: 'xs' },
  buttonS: { fontWeight: 'Bold', fontSize: 'sm', lineHeight: 'md', textCase: 'uppercase' },
  buttonM: { fontWeight: 'Bold', fontSize: 'md', lineHeight: 'md', textCase: 'uppercase' },
  buttonTabsS: { fontWeight: 'Bold', fontSize: 'sm', lineHeight: 'sm' },
  buttonTabsM: { fontWeight: 'Bold', fontSize: 'sm', lineHeight: ButtonSize.xxs, textCase: 'uppercase' },
  buttonTabsL: { fontWeight: 'Bold', fontSize: 'xl', lineHeight: 'lg', textCase: 'uppercase' },

  tableHeaderM: { fontWeight: 'Medium', fontSize: 'sm', lineHeight: 'xs', fontVariantNumeric: TABULAR_NUMS },
  tableHeaderS: { fontWeight: 'Medium', fontSize: 'xs', lineHeight: 'xs', fontVariantNumeric: TABULAR_NUMS },
  tableCellL: { fontWeight: 'Bold', fontSize: Sizing[200], lineHeight: Spacing[400], fontVariantNumeric: TABULAR_NUMS },
  tableCellMRegular: { fontWeight: 'Normal', fontSize: 'md', lineHeight: 'sm', fontVariantNumeric: TABULAR_NUMS },
  tableCellMBold: { fontWeight: 'Bold', fontSize: 'md', lineHeight: 'sm', fontVariantNumeric: TABULAR_NUMS },
  tableCellSRegular: { fontWeight: 'Normal', fontSize: 'sm', lineHeight: 'xs', fontVariantNumeric: TABULAR_NUMS },
  tableCellSBold: { fontWeight: 'Bold', fontSize: 'sm', lineHeight: 'xs', fontVariantNumeric: TABULAR_NUMS },

  highlightXsNotional: { fontWeight: 'Normal', fontSize: 'xs', fontVariantNumeric: TABULAR_NUMS },
  highlightXs: { fontWeight: 'Bold', fontSize: 'xs', fontVariantNumeric: TABULAR_NUMS },
  highlightS: { fontWeight: 'Bold', fontSize: 'sm', fontVariantNumeric: TABULAR_NUMS },
  highlightM: { fontWeight: 'Bold', fontSize: 'md', lineHeight: 'sm', fontVariantNumeric: TABULAR_NUMS },
  highlightL: { fontWeight: 'Bold', fontSize: 'lg', lineHeight: Sizing[300], fontVariantNumeric: TABULAR_NUMS },
  highlightXl: { fontWeight: 'Bold', fontSize: 'xl', lineHeight: 'lg', letterSpacing: '-1.28px', fontVariantNumeric: TABULAR_NUMS },
  highlightXxl: { fontWeight: 'Bold', fontSize: 'xxl', letterSpacing: '-2.56px', fontVariantNumeric: TABULAR_NUMS },
} as const satisfies Record<string, TypographyVariantDefinition>

export const createTypography = ({ Text }: DesignSystem) =>
  ({
    fontFamily: Fonts[Text.FontFamily],
    fontWeightBold: Text.FontWeight.Bold,
    fontWeightMedium: Text.FontWeight.Medium,
    fontWeightRegular: Text.FontWeight.Normal,
    fontWeightLight: Text.FontWeight.Light,

    ...disabledTypographyKeys.reduce(
      (acc, variant) => ({ ...acc, [variant]: undefined }),
      {} as TypographyVariantsOptions,
    ),

    ...Object.fromEntries(
      Object.entries(TYPOGRAPHY_VARIANTS).map(([key, def]) => {
        const definition = { ...def, ...Text.TypographyVariantOverrides[key] }
        return [key, { ...variant(Text.FontWeight, definition), fontFamily: Fonts[Text.FontFamily] }]
      }),
    ),
  }) as TypographyVariantsOptions

export type DisabledTypographyVariantKey = typeof disabledTypographyKeys
export type TypographyVariantKey = keyof typeof TYPOGRAPHY_VARIANTS
