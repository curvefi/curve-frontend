/// <reference types="./mui-card-content.d.ts" />
import { DesignSystem } from '@evm-ui/themes/design'
import { TRANSPARENT } from '@evm-ui/themes/design/0_primitives'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import type { Components } from '@mui/material/styles'
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
