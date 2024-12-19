import type { Components } from '@mui/material/styles'
import { TypographyVariantKey } from './create-typography'

const variantMapping = {
  headingXxl: 'h1',
  headingMBold: 'h2',
  headingMLight: 'h3',
  headingSBold: 'h4',
  headingXsBold: 'h5',
  headingXsMedium: 'h6',

  bodyMRegular: 'p',
  bodyMBold: 'p',
  bodySRegular: 'p',
  bodySBold: 'p',
  bodyXsRegular: 'p',
  bodyXsBold: 'p',

  buttonXs: 'span',
  buttonS: 'span',
  buttonM: 'span',

  tableHeaderM: 'p',
  tableHeaderS: 'p',
  tableCellL: 'p',
  tableCellMRegular: 'p',
  tableCellMBold: 'p',
  tableCellSRegular: 'p',
  tableCellSBold: 'p',

  highlightXsNotional: 'p',
  highlightXs: 'p',
  highlightS: 'p',
  highlightM: 'p',
  highlightL: 'p',
  highlightXl: 'p',
  highlightXxl: 'p',
} as const satisfies Record<TypographyVariantKey, keyof HTMLElementTagNameMap>

export const defineMuiTypography = (): Components['MuiTypography'] => ({
  defaultProps: { variant: 'bodyMRegular', variantMapping },
})
