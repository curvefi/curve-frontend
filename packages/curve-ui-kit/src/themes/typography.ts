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
/* TOKENS-STUDIO:BEGIN_TYPOGRAPHY_VARIANTS */
export const TYPOGRAPHY_VARIANTS = {
  "bodyMBold": {
    "fontFamily": "Heading",
    "fontWeight": "Semi_Bold",
    "fontSize": "16px",
    "lineHeight": "md",
    "letterSpacing": "0px"
  },
  "bodyMRegular": {
    "fontFamily": "Heading",
    "fontWeight": "Medium",
    "fontSize": "16px",
    "lineHeight": "md",
    "letterSpacing": "0px"
  },
  "bodySBold": {
    "fontFamily": "Heading",
    "fontWeight": "Semi_Bold",
    "fontSize": "14px",
    "lineHeight": "sm",
    "letterSpacing": "0px"
  },
  "bodySRegular": {
    "fontFamily": "Heading",
    "fontWeight": "Medium",
    "fontSize": "14px",
    "lineHeight": "sm",
    "letterSpacing": "0px"
  },
  "bodyXsBold": {
    "fontFamily": "Heading",
    "fontWeight": "Semi_Bold",
    "fontSize": "12px",
    "lineHeight": "xs",
    "letterSpacing": "0px"
  },
  "bodyXsRegular": {
    "fontFamily": "Heading",
    "fontWeight": "Medium",
    "fontSize": "12px",
    "lineHeight": "xs",
    "letterSpacing": "0px"
  },
  "buttonlabelTabsL": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "32px",
    "lineHeight": "lg",
    "textCase": "uppercase"
  },
  "buttonlabelTabsM": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "14px",
    "lineHeight": Sizing["150"],
    "textCase": "uppercase"
  },
  "buttonlabelTabsS": {
    "fontFamily": "Heading",
    "fontWeight": "Semi_Bold",
    "fontSize": "16px",
    "lineHeight": "md"
  },
  "buttonlabelXXS": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "12px",
    "lineHeight": "xs"
  },
  "buttonM": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "16px",
    "lineHeight": "xl",
    "textCase": "uppercase"
  },
  "buttonS": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "14px",
    "lineHeight": "md",
    "textCase": "uppercase"
  },
  "buttonXs": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "14px",
    "lineHeight": "xs"
  },
  "headingMBold": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "32px",
    "lineHeight": "lg",
    "letterSpacing": "-4%",
    "textCase": "uppercase"
  },
  "headingMLight": {
    "fontFamily": "Heading",
    "fontWeight": "Medium",
    "fontSize": "32px",
    "lineHeight": "lg",
    "letterSpacing": "-4%",
    "textCase": "uppercase"
  },
  "headingSBold": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "24px",
    "lineHeight": "md",
    "letterSpacing": "-2%",
    "textCase": "uppercase"
  },
  "headingXsBold": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "14px",
    "lineHeight": "sm",
    "textCase": "uppercase"
  },
  "headingXsMedium": {
    "fontFamily": "Heading",
    "fontWeight": "Medium",
    "fontSize": "14px",
    "lineHeight": "sm",
    "textCase": "capitalize"
  },
  "headingXxl": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "64px",
    "lineHeight": "xxl",
    "letterSpacing": "-4%"
  },
  "highlightL": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "24px",
    "lineHeight": "md"
  },
  "highlightM": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "16px",
    "lineHeight": "sm"
  },
  "highlightS": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "14px",
    "lineHeight": "sm"
  },
  "highlightXl": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "32px",
    "lineHeight": "lg",
    "letterSpacing": "-4%"
  },
  "highlightXs": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "12px",
    "lineHeight": "xs"
  },
  "highlightXsNotional": {
    "fontFamily": "Heading",
    "fontWeight": "Medium",
    "fontSize": "12px",
    "lineHeight": "xs"
  },
  "highlightXxl": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "64px",
    "lineHeight": "xxl",
    "letterSpacing": "-4%"
  },
  "tableCellL": {
    "fontFamily": "Heading",
    "fontWeight": "Bold",
    "fontSize": "20px",
    "lineHeight": Sizing["250"]
  },
  "tableCellMBold": {
    "fontFamily": "Heading",
    "fontWeight": "Semi_Bold",
    "fontSize": "16px",
    "lineHeight": "sm"
  },
  "tableCellMRegular": {
    "fontFamily": "Heading",
    "fontWeight": "Medium",
    "fontSize": "16px",
    "lineHeight": "sm"
  },
  "tableCellSBold": {
    "fontFamily": "Heading",
    "fontWeight": "Semi_Bold",
    "fontSize": "14px",
    "lineHeight": "xs"
  },
  "tableCellSRegular": {
    "fontFamily": "Heading",
    "fontWeight": "Medium",
    "fontSize": "14px",
    "lineHeight": "xs"
  },
  "tableHeaderM": {
    "fontFamily": "Heading",
    "fontWeight": "Medium",
    "fontSize": "16px",
    "lineHeight": "sm",
    "letterSpacing": "0px"
  },
  "tableHeaderS": {
    "fontFamily": "Heading",
    "fontWeight": "Medium",
    "fontSize": "14px",
    "lineHeight": "xs",
    "letterSpacing": "0px"
  }
} as const
/* TOKENS-STUDIO:END_TYPOGRAPHY_VARIANTS */

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
