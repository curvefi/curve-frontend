/// <reference types="./mui-card-header.d.ts" />
import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { DesignSystem } from '@ui-kit/themes/design'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { BorderWidth, Spacing, Sizing } = SizesAndSpaces

export const cardHeaderSmallStyles = (typography: TypographyVariantsOptions) => ({
  '& .MuiCardHeader-title': typography.headingXsBold,
  ...handleBreakpoints({ minHeight: Sizing.lg }),
})

export const cardHeaderInlineStyles = (design: DesignSystem, typography: TypographyVariantsOptions) => ({
  ...cardHeaderSmallStyles(typography),
  borderBottom: `${BorderWidth.thin} solid ${design.Layer[3].Outline}`,
  ...handleBreakpoints({
    minHeight: Sizing.md,
    paddingInline: 0,
  }),
})

export const defineMuiCardHeader = (
  design: DesignSystem,
  typography: TypographyVariantsOptions,
): Components['MuiCardHeader'] => ({
  styleOverrides: {
    root: {
      padding: 0,
      ...handleBreakpoints({
        paddingBlockEnd: Spacing.xs,
        minHeight: Sizing.xl,
        gap: Spacing.xs,
      }),
      '& .MuiCardHeader-title': { color: design.Text.TextColors.Secondary },
      '& .MuiCardHeader-avatar': handleBreakpoints({ marginRight: Spacing.md }),
      alignItems: 'end',
    },
    action: { margin: 0, alignSelf: 'end' },
    title: typography.headingSBold,
  },
  variants: [
    {
      props: { size: 'small' },
      style: cardHeaderSmallStyles(typography),
    },
    {
      props: { size: 'inline' },
      style: cardHeaderInlineStyles(design, typography),
    },
  ],
})
