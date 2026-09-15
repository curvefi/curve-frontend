/// <reference types="./mui-card.d.ts" />
import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { DesignSystem } from '@ui/features/themes/design'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { cardContentInlineStyles, cardContentSmallStyles } from '../card-content'
import { createHeaderStyle, createInlineHeaderStyle } from '../card-header'

const { BorderWidth } = SizesAndSpaces

export const defineMuiCard = (design: DesignSystem, typography: TypographyVariantsOptions): Components['MuiCard'] => ({
  styleOverrides: {
    root: {
      backgroundColor: 'transparent', // We want the paper elevation only on the card content, not the header. Mui adds a bgColor by default.
      boxShadow: 'none',
    },
  },
  // Keep styles on direct children so they do not leak into nested cards.
  variants: [
    {
      props: { size: 'small' },
      style: {
        '& > .MuiCardHeader-root': createHeaderStyle(design, typography, 'small'),
        '& > .MuiCardContent-root': cardContentSmallStyles,
      },
    },
    {
      /** Use inline for sections within a page or card: content has no padding or background. */
      props: { variant: 'inline' },
      style: {
        '& > .MuiCardHeader-root': {
          ...createInlineHeaderStyle(design),
          // The header border only appears when it is a direct child of an inline Card.
          borderBottom: `${BorderWidth.thin} solid ${design.Layer[3].Outline}`,
        },
        '& > .MuiCardContent-root': cardContentInlineStyles,
      },
    },
  ],
})
