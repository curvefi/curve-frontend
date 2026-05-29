/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { CSSObject } from '@mui/system'
import type { TypographyVariantKey, DisabledTypographyVariantKey } from '../../typography'

type NewTypographyVariants<T> = Record<TypographyVariantKey, T>
type DisabledTypographyVariants = Record<DisabledTypographyVariantKey[number], false>

declare module '@mui/material/styles' {
  interface TypographyVariants extends NewTypographyVariants<CSSObject> {}
  interface TypographyVariantsOptions extends Partial<NewTypographyVariants<CSSObject>> {}
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides extends NewTypographyVariants<true>, DisabledTypographyVariants {}
}
