import type { CSSObject } from '@mui/system'
import type { TypographyVariantKey, DisabledTypographyVariantKey } from '../../typography'

type NewTypographyVariants<T> = { [key in TypographyVariantKey]: T }
type DisabledTypographyVariants = { [key in DisabledTypographyVariantKey[number]]: false }

declare module '@mui/material/styles' {
  type TypographyVariants = {} & NewTypographyVariants<CSSObject>
  type TypographyVariantsOptions = {} & Partial<NewTypographyVariants<CSSObject>>
}

declare module '@mui/material/Typography' {
  type TypographyPropsVariantOverrides = {} & NewTypographyVariants<true> & DisabledTypographyVariants
}
