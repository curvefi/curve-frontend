/// <reference types="./mui-card.d.ts" />
import type { CardProps } from '@mui/material/Card'
import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { objectKeys } from '@primitives/objects.utils'
import { DesignSystem } from '@ui/features/themes/design'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { CARD_CONTENT_SIZE_STYLES, cardContentInlineStyles } from '../card-content'
import { createHeaderStyle, createInlineHeaderStyle } from '../card-header'

const { BorderWidth } = SizesAndSpaces

type CardSize = NonNullable<CardProps['size']>

export const defineMuiCard = (design: DesignSystem, typography: TypographyVariantsOptions): Components['MuiCard'] => ({
  defaultProps: { size: 'medium' },
  styleOverrides: {
    root: {
      backgroundColor: 'transparent', // We want the paper elevation only on the card content, not the header. Mui adds a bgColor by default.
      boxShadow: 'none',
    },
  },
  // Keep styles on direct children so they do not leak into nested cards.
  variants: [
    ...objectKeys(CARD_CONTENT_SIZE_STYLES).map((size: CardSize) => ({
      props: { size },
      style: {
        '& > .MuiCardHeader-root': createHeaderStyle(design, typography, size),
        '& > .MuiCardContent-root': CARD_CONTENT_SIZE_STYLES[size],
      },
    })),
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
