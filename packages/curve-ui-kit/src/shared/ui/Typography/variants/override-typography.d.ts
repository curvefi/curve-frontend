declare module 'global' {
  type NewTypographyVariants<T> = {
    [key in import('./config').TypographyVariantKey]: T
  }
  type DisabledTypographyVariants = {
    [key in import('./config').DisabledTypographyVariantKey]: false
  }

  module '@mui/material/styles' {
    interface TypographyVariants extends NewTypographyVariants<React.CSSProperties> {}
    interface TypographyVariantsOptions extends Partial<NewTypographyVariants<React.CSSProperties>> {}
  }

  module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides extends NewTypographyVariants<true>, DisabledTypographyVariants {}
  }
}
