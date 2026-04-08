import { Breakpoint } from '@mui/material'
import { type TypographyVariantsOptions } from '@mui/material/styles'
import { basicMuiTheme } from './basic-theme'
import { DesignSystem } from './design'
import { Sizing, TransitionFunction } from './design/0_primitives'
import { SizesAndSpaces } from './design/1_sizes_spaces'
import { Fonts } from './fonts'

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

const { LineHeight, FontWeight, FontSize } = SizesAndSpaces

export type TypographyVariantDefinition = {
  fontFamily: keyof DesignSystem['Text']['FontFamily']
  fontSize: string | keyof typeof FontSize
  fontWeight?: keyof typeof FontWeight
  lineHeight?: string | keyof typeof LineHeight
  letterSpacing?: string
  textCase?: 'uppercase' | 'capitalize'
  marginBottom?: number
}

const responsiveValues = (
  fontSize: string | keyof typeof FontSize,
  lineHeight: string | keyof typeof LineHeight | undefined,
  breakpoint: Breakpoint,
) => ({
  [basicMuiTheme.breakpoints.up(breakpoint)]: {
    fontSize: FontSize[fontSize as keyof typeof FontSize]?.[breakpoint],
    lineHeight: LineHeight[lineHeight as keyof typeof LineHeight]?.[breakpoint],
  },
})

const variant = ({
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight = fontSize,
  letterSpacing = '0%',
  textCase,
}: TypographyVariantDefinition) => ({
  fontFamily,
  fontWeight: FontWeight[fontWeight ?? 'Medium'],
  letterSpacing,
  // Undo the letter spacing to the right of the last letter
  ...(letterSpacing !== '0%' && {
    marginRight: `calc(${letterSpacing} * -1)`,
  }),
  textTransform: textCase ?? 'none',
  transition: `color ${TransitionFunction}, border ${TransitionFunction}`, // border is used in the chip, for example
  ...(!(fontSize in FontSize) && { fontSize }),
  ...(!(lineHeight in LineHeight) && { lineHeight }),
  ...responsiveValues(fontSize, lineHeight, 'mobile'),
  ...responsiveValues(fontSize, lineHeight, 'tablet'),
  ...responsiveValues(fontSize, lineHeight, 'desktop'),
})

// prettier-ignore
export const TYPOGRAPHY_VARIANTS = {
  headingXxl: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'xxl', letterSpacing: '-2.56px' },
  headingMBold: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'xl', lineHeight: Sizing[400], letterSpacing: '-1.28px', textCase: 'uppercase' },
  headingMLight: { fontFamily: 'Heading', fontWeight: 'Normal', fontSize: 'xl', lineHeight: Sizing[450], letterSpacing: '-1.28px', textCase: 'uppercase' },
  headingSBold: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'lg', lineHeight: 'md', letterSpacing: '-0.48px', textCase: 'uppercase' },
  headingXsBold: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'sm', textCase: 'uppercase' },
  headingXsMedium: { fontFamily: 'Heading', fontSize: 'sm', textCase: 'capitalize' },

  bodyMRegular: { fontFamily: 'Body', fontSize: 'md' },
  bodyMBold: { fontFamily: 'Body', fontWeight: 'Bold', fontSize: 'md' },
  bodySRegular: { fontFamily: 'Body', fontSize: 'sm', fontWeight: 'Normal', lineHeight: 'sm' },
  bodySBold: { fontFamily: 'Body', fontWeight: 'Bold', fontSize: 'sm' },
  bodyXsRegular: { fontFamily: 'Body', fontSize: 'xs' },
  bodyXsBold: { fontFamily: 'Body', fontWeight: 'Bold', fontSize: 'xs' },

  buttonXs: { fontFamily: 'Button', fontWeight: 'Bold', fontSize: 'sm' },
  buttonS: { fontFamily: 'Button', fontWeight: 'Bold', fontSize: 'sm', lineHeight: 'md', textCase: 'uppercase' },
  buttonM: { fontFamily: 'Button', fontWeight: 'Bold', fontSize: 'md', lineHeight: 'xl', textCase: 'uppercase' },

  tableHeaderM: { fontFamily: 'Body', fontWeight: 'Medium', fontSize: 'md', lineHeight: 'sm' },
  tableHeaderS: { fontFamily: 'Body', fontWeight: 'Medium', fontSize: 'sm', lineHeight: 'xs' },
  tableCellL: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: Sizing[250], lineHeight: Sizing[250] },
  tableCellMRegular: { fontFamily: 'Mono', fontWeight: 'Medium', fontSize: 'md', lineHeight: 'sm' },
  tableCellMBold: { fontFamily: 'Mono', fontWeight: 'Semi_Bold', fontSize: 'md', lineHeight: 'sm' },
  tableCellSRegular: { fontFamily: 'Mono', fontWeight: 'Medium', fontSize: 'sm', lineHeight: 'xs' },
  tableCellSBold: { fontFamily: 'Mono', fontWeight: 'Semi_Bold', fontSize: 'sm', lineHeight: 'xs' },

  highlightXsNotional: { fontFamily: 'Mono', fontSize: 'xs' },
  highlightXs: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'xs' },
  highlightS: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'sm' },
  highlightM: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'md', lineHeight: 'sm' },
  highlightL: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'lg', lineHeight: 'md' },
  highlightXl: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'xl', lineHeight: Sizing[400], letterSpacing: '-1.28px' },
  highlightXxl: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'xxl', letterSpacing: '-2.56px' },
} as const satisfies Record<string, TypographyVariantDefinition>

export const createTypography = ({ Text }: DesignSystem) =>
  ({
    fontFamily: Fonts[Text.FontFamily.Body],
    fontWeightBold: FontWeight.Bold,
    fontWeightMedium: FontWeight.Medium,
    fontWeightRegular: FontWeight.Normal,
    fontWeightLight: FontWeight.Light,
    ...disabledTypographyKeys.reduce(
      (acc, variant) => ({ ...acc, [variant]: undefined }),
      {} as TypographyVariantsOptions,
    ),
    ...Object.fromEntries(
      Object.entries(TYPOGRAPHY_VARIANTS).map(([key, def]) => {
        const { fontFamily, ...value } = variant(def)
        return [key, { ...value, fontFamily: Fonts[Text.FontFamily[fontFamily]] }]
      }),
    ),
  }) as TypographyVariantsOptions

export type DisabledTypographyVariantKey = typeof disabledTypographyKeys
export type TypographyVariantKey = keyof typeof TYPOGRAPHY_VARIANTS
