import { Breakpoint } from '@mui/material'
import { type TypographyVariantsOptions } from '@mui/material/styles'
import { basicMuiTheme } from './basic-theme'
import { DesignSystem } from './design'
import { TransitionFunction } from './design/0_primitives'
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
  headingXxl: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'xxl', lineHeight: 'xxl', letterSpacing: '-4%' },
  headingMBold: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'xl', lineHeight: 'lg', letterSpacing: '-4%', textCase: 'uppercase' },
  headingMLight: { fontFamily: 'Heading', fontWeight: 'Medium', fontSize: 'xl', lineHeight: 'lg', letterSpacing: '-4%', textCase: 'uppercase' },
  headingSBold: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'lg', lineHeight: 'md', letterSpacing: '-2%', textCase: 'uppercase' },
  headingXsBold: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'sm', lineHeight: 'sm', letterSpacing: '0%', textCase: 'uppercase' },
  headingXsMedium: { fontFamily: 'Heading', fontWeight: 'Medium', fontSize: 'sm', lineHeight: 'sm', letterSpacing: '0%' },

  bodyMRegular: { fontFamily: 'Heading', fontWeight: 'Medium', fontSize: 'md', lineHeight: 'md', letterSpacing: '0' },
  bodyMBold: { fontFamily: 'Heading', fontWeight: 'Semi_Bold', fontSize: 'md', lineHeight: 'md', letterSpacing: '0' },
  bodySRegular: { fontFamily: 'Heading', fontWeight: 'Medium', fontSize: 'sm', lineHeight: 'sm', letterSpacing: '0' },
  bodySBold: { fontFamily: 'Heading', fontWeight: 'Semi_Bold', fontSize: 'sm', lineHeight: 'sm', letterSpacing: '0' },
  bodyXsRegular: { fontFamily: 'Heading', fontWeight: 'Medium', fontSize: 'xs', lineHeight: 'xs', letterSpacing: '0' },
  bodyXsBold: { fontFamily: 'Heading', fontWeight: 'Semi_Bold', fontSize: 'xs', lineHeight: 'xs', letterSpacing: '0' },

  buttonXs: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'sm', lineHeight: 'xs', letterSpacing: '0%' },
  buttonXxs: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'xs', lineHeight: 'xs', letterSpacing: '0%' },
  buttonS: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'sm', lineHeight: 'md', letterSpacing: '0%', textCase: 'uppercase' },
  buttonM: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'md', lineHeight: 'md', letterSpacing: '0%', textCase: 'uppercase' },
  buttonTabsS: { fontFamily: 'Heading', fontWeight: 'Semi_Bold', fontSize: 'md', lineHeight: 'md', letterSpacing: '0%' },
  buttonTabsM: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'sm', lineHeight: '1rem', letterSpacing: '0%', textCase: 'uppercase' },
  buttonTabsL: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'xl', lineHeight: 'lg', letterSpacing: '0%', textCase: 'uppercase' },

  tableHeaderM: { fontFamily: 'Heading', fontWeight: 'Medium', fontSize: 'sm', lineHeight: 'xs', letterSpacing: '0' },
  tableHeaderS: { fontFamily: 'Heading', fontWeight: 'Medium', fontSize: 'xs', lineHeight: 'xs', letterSpacing: '0' },
  tableCellL: { fontFamily: 'Heading', fontWeight: 'Extra_Bold', fontSize: 'md', lineHeight: '1rem', letterSpacing: '0%' },
  tableCellMRegular: { fontFamily: 'Heading', fontWeight: 'Medium', fontSize: 'md', lineHeight: 'sm', letterSpacing: '0%' },
  tableCellMBold: { fontFamily: 'Heading', fontWeight: 'Semi_Bold', fontSize: 'md', lineHeight: 'sm', letterSpacing: '0%' },
  tableCellSRegular: { fontFamily: 'Heading', fontWeight: 'Medium', fontSize: 'sm', lineHeight: 'xs', letterSpacing: '0%' },
  tableCellSBold: { fontFamily: 'Heading', fontWeight: 'Semi_Bold', fontSize: 'sm', lineHeight: 'xs', letterSpacing: '0%' },

  highlightXsNotional: { fontFamily: 'Heading', fontWeight: 'Medium', fontSize: 'xs', lineHeight: 'xs', letterSpacing: '0%' },
  highlightXs: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'xs', lineHeight: 'xs', letterSpacing: '0%' },
  highlightS: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'sm', lineHeight: 'sm', letterSpacing: '0%' },
  highlightM: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'md', lineHeight: 'sm', letterSpacing: '0%' },
  highlightL: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'lg', lineHeight: 'md', letterSpacing: '0%' },
  highlightXl: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'xl', lineHeight: 'lg', letterSpacing: '-4%' },
  highlightXxl: { fontFamily: 'Heading', fontWeight: 'Bold', fontSize: 'xxl', lineHeight: 'xxl', letterSpacing: '-4%' },
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
