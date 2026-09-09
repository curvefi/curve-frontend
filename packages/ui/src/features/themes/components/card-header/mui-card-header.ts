/// <reference types="./mui-card-header.d.ts" />
import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { handleBreakpoints } from '@ui/features/themes/basic-theme'
import { DesignSystem } from '@ui/features/themes/design'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { BorderWidth, Spacing, Sizing, ButtonSize, Tab } = SizesAndSpaces

export const cardHeaderSmallStyles = (design: DesignSystem, typography: TypographyVariantsOptions) => ({
  '& .MuiCardHeader-title': { ...typography.headingXsBold, color: design.Tabs.Contained.Current.Label },
  '& .MuiCardHeader-content': {
    backgroundColor: design.Layer[1].Fill,
    display: 'flex',
    flex: '0 1 auto',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: ButtonSize.sm,
    ...handleBreakpoints({ paddingInline: Spacing[Tab.Padding.medium.inline] }),
  },
  '& .MuiCardHeader-action': { alignSelf: 'end', margin: 0, paddingBlockEnd: Spacing.xs, marginInlineStart: 'auto' },
  ...handleBreakpoints({ minHeight: ButtonSize.sm, padding: 0 }),
})

export const cardHeaderInlineStyles = (design: DesignSystem, typography: TypographyVariantsOptions) => ({
  ...cardHeaderSmallStyles(design, typography),
  borderBottom: `${BorderWidth.thin} solid ${design.Layer[3].Outline}`,
  ...handleBreakpoints({ minHeight: Sizing.sm, paddingInline: 0 }),
})

export const defineMuiCardHeader = (
  design: DesignSystem,
  typography: TypographyVariantsOptions,
): Components['MuiCardHeader'] => ({
  styleOverrides: {
    root: {
      padding: 0,
      ...handleBreakpoints({ paddingBlockEnd: Spacing.xs, minHeight: Sizing.xl, gap: Spacing.xs }),
      '& .MuiCardHeader-title': { color: design.Text.TextColors.Secondary },
      '& .MuiCardHeader-avatar': handleBreakpoints({ marginRight: Spacing.md }),
      alignItems: 'end',
    },
    action: { margin: 0, alignSelf: 'end' },
    title: typography.headingSBold,
  },
  variants: [
    { props: { size: 'small' }, style: cardHeaderSmallStyles(design, typography) },
    { props: { size: 'inline' }, style: cardHeaderInlineStyles(design, typography) },
  ],
})
