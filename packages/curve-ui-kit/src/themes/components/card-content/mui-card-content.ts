/// <reference types="./mui-card-content.d.ts" />
import type { Components } from '@mui/material/styles'
import { DesignSystem } from '@ui-kit/themes/design'
import { TRANSPARENT } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { handleBreakpoints } from '../../basic-theme'

const { Padding } = SizesAndSpaces

export const cardContentSmallStyles = {
  padding: Padding.Card.sm,
  '&:last-child': { paddingBlockEnd: Padding.Card.sm },
}

export const cardContentInlineStyles = {
  ...handleBreakpoints({ padding: 0 }),
  '&:last-child': handleBreakpoints({ paddingBlockEnd: 0 }),
  '&.MuiCardContent-root': {
    backgroundColor: TRANSPARENT,
  },
}

export const defineMuiCardContent = (design: DesignSystem): Components['MuiCardContent'] => ({
  styleOverrides: {
    root: {
      backgroundColor: design.Layer[1].Fill,
      padding: Padding.Card.md,
      '&:last-child': { paddingBlockEnd: Padding.Card.md },
    },
  },
  variants: [
    {
      props: { size: 'small' },
      style: cardContentSmallStyles,
    },
    {
      props: { size: 'inline' },
      style: cardContentInlineStyles,
    },
  ],
})
