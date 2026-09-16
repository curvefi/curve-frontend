/// <reference types="./mui-card-header.d.ts" />
import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { handleBreakpoints } from '@ui/features/themes/basic-theme'
import { DesignSystem } from '@ui/features/themes/design'
import { TRANSPARENT } from '@ui/features/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { CARD_SIZES, type CardSize } from '../card-sizes'

const { ButtonSize, Spacing, Sizing: ResponsiveSizing, Tab } = SizesAndSpaces

const CARD_HEADER_SIZES = {
  extraSmall: {
    minHeight: ButtonSize.xs,
    typography: 'headingXsBold',
    color: design => design.Tabs.Contained.Current.Label,
  },
  small: {
    minHeight: ButtonSize.sm,
    typography: 'headingXsBold',
    color: design => design.Tabs.Contained.Current.Label,
  },
  medium: { minHeight: ButtonSize.sm, typography: 'headingSBold', color: design => design.Text.TextColors.Secondary },
} as const satisfies Record<
  CardSize,
  { minHeight: string; typography: keyof TypographyVariantsOptions; color: (design: DesignSystem) => string }
>

export const createHeaderStyle = (design: DesignSystem, typography: TypographyVariantsOptions, size: CardSize) => {
  const { minHeight, typography: titleTypography, color } = CARD_HEADER_SIZES[size]
  return {
    '& .MuiCardHeader-title': { ...typography[titleTypography], color: color(design) },
    '& .MuiCardHeader-content': {
      display: 'flex',
      flex: '0 1 auto',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight,
      ...handleBreakpoints({ paddingInline: Spacing[Tab.Padding.medium.inline] }),
    },
    '& .MuiCardHeader-action': handleBreakpoints({
      alignSelf: 'end',
      margin: 0,
      paddingBlockEnd: Spacing.xs,
      marginInlineStart: 'auto',
    }),
    ...handleBreakpoints({ minHeight, padding: 0 }),
  }
}

export const createInlineHeaderStyle = (design: DesignSystem) => ({
  '& .MuiCardHeader-title': { color: design.Text.TextColors.Secondary },
  '& .MuiCardHeader-content': { backgroundColor: TRANSPARENT, paddingInline: 0, minHeight: 0, alignSelf: 'stretch' },
})

export const defineMuiCardHeader = (
  design: DesignSystem,
  typography: TypographyVariantsOptions,
): Components['MuiCardHeader'] => ({
  defaultProps: { size: 'small' },
  styleOverrides: {
    root: {
      padding: 0,
      ...handleBreakpoints({ paddingBlockEnd: Spacing.xs, minHeight: ResponsiveSizing.xl, gap: Spacing.xs }),
      '& .MuiCardHeader-title': { color: design.Text.TextColors.Secondary },
      '& .MuiCardHeader-avatar': handleBreakpoints({ marginRight: Spacing.md }),
      alignItems: 'end',
    },
    action: { margin: 0, alignSelf: 'end' },
    content: { backgroundColor: design.Layer[1].Fill },
    title: typography.headingSBold,
  },
  variants: [
    ...CARD_SIZES.map(size => ({ props: { size }, style: createHeaderStyle(design, typography, size) })),
    { props: { variant: 'inline' }, style: createInlineHeaderStyle(design) },
    {
      props: { variant: 'modal' },
      style: {
        ...createInlineHeaderStyle(design),
        ...handleBreakpoints({ paddingInline: Spacing.md, paddingBlock: Spacing.sm }),
        alignItems: 'center',
        '& .MuiCardHeader-action': { alignSelf: 'center' },
      },
    },
  ],
})
