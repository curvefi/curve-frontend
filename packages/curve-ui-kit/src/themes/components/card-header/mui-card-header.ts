/// <reference types="./mui-card-header.d.ts" />
import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { DesignSystem } from '@ui-kit/themes/design'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, ButtonSize } = SizesAndSpaces

export const defineMuiCardHeader = (
  design: DesignSystem,
  typography: TypographyVariantsOptions,
): Components['MuiCardHeader'] => ({
  styleOverrides: {
    root: {
      padding: 0,
      ...handleBreakpoints({
        paddingInlineStart: Spacing.sm,
        paddingBlockEnd: Spacing.xs,
        minHeight: ButtonSize.lg,
        gap: Spacing.xs,
      }),
      '& .MuiCardHeader-avatar': handleBreakpoints({ marginRight: Spacing.md }),
      alignItems: 'end',
    },
    action: { margin: 0, alignSelf: 'end' },
    title: typography.headingSBold,
  },
  variants: [
    {
      props: { size: 'small' },
      style: {
        '& .MuiCardHeader-title': {
          color: design.Text.TextColors.Secondary,
          ...typography.headingXsBold,
        },
        ...handleBreakpoints({ minHeight: ButtonSize.sm }),
      },
    },
    {
      props: { 'data-inline': true },
      style: {
        borderBottom: `1px solid ${design.Layer[3].Outline}`,
        ...handleBreakpoints({
          paddingInline: 0,
        }),
      },
    },
  ],
})
