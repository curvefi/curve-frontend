import type { CSSProperties } from 'react'
import type { TypographyVariantKey, DisabledTypographyVariantKey } from './create-typography'

type NewTypographyVariants<T> = { [key in TypographyVariantKey]: T }
type DisabledTypographyVariants = { [key in DisabledTypographyVariantKey[number]]: false }

declare module '@mui/material/styles' {
  interface TypographyVariants extends NewTypographyVariants<CSSProperties> {}
  interface TypographyVariantsOptions extends Partial<NewTypographyVariants<CSSProperties>> {}
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides extends NewTypographyVariants<true>, DisabledTypographyVariants {}
}
