/// <reference types="./mui-card-header.d.ts" />
import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { DesignSystem } from '@ui-kit/themes/design'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Sizing, Spacing, ButtonSize } = SizesAndSpaces

export const defineMuiCardHeader = (
  design: DesignSystem,
  typography: TypographyVariantsOptions,
): Components['MuiCardHeader'] => ({
  styleOverrides: {
    root: {
      ...handleBreakpoints({
        paddingBlockStart: Spacing.lg,
        paddingBlockEnd: Spacing.sm,
        paddingInline: Spacing.md,
      }),
      borderBottom: `1px solid ${design.Layer[3].Outline}`,
      minHeight: `calc(${ButtonSize.lg} + 1px)`, // 1px to account for border
      '& .MuiCardHeader-avatar': handleBreakpoints({ marginRight: Spacing.md }),
    },
    action: { alignContent: 'center', alignSelf: 'center', margin: 0 },
    title: typography.headingSBold,
  },
  variants: [
    {
      props: { size: 'small' },
      style: {
        minHeight: 'auto',
        maxHeight: Sizing.md.desktop,
        paddingBlockStart: Spacing.md.desktop,
        paddingBlockEnd: Spacing.xs.desktop,
        '& .MuiCardHeader-title': typography.headingXsBold,
      },
    },
    {
      props: { 'data-inline': true },
      style: handleBreakpoints({
        paddingInline: 0,
      }),
    },
  ],
})
