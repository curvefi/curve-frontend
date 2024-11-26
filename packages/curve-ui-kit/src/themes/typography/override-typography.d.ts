declare module 'global' {
  type TypographyConfig = import('./create-typography')
  type TypographyVariantKey = TypographyConfig['TypographyVariantKey']

  type NewTypographyVariants<T> = {[key in TypographyVariantKey]: T}
  type DisabledTypographyVariants = {[key in TypographyConfig['DisabledTypographyVariantKey']]: false}

  // type TypographyVariants = {[key in TypographyVariantKey]: CSSProperties}

  module '@mui/material/styles' {
    interface TypographyVariants extends NewTypographyVariants<React.CSSProperties> {}
    interface TypographyVariantsOptions extends Partial<NewTypographyVariants<React.CSSProperties>> {}
  }

  module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides extends NewTypographyVariants<true>, DisabledTypographyVariants {}
  }

  // module '@mui/system' {
  //   interface Typography extends TypographyVariants {}
  // }
}

declare module "react" {
  interface CSSProperties {
    "--font-monaSans"?: string
    "--font-hubotSans"?: string
    "--font-minecraft"?: string
  }
}
