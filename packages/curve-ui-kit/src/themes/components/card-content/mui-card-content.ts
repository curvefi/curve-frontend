/// <reference types="./mui-card-content.d.ts" />
import type { Components } from '@mui/material/styles'
import { DesignSystem } from '@ui-kit/themes/design'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { handleBreakpoints } from '../../basic-theme'

const { Spacing } = SizesAndSpaces

const Padding = {
  xs: Spacing.xs,
  sm: Spacing.sm,
  md: Spacing.md,
  lg: Spacing.lg,
}

export const defineMuiCardContent = (design: DesignSystem): Components['MuiCardContent'] => ({
  styleOverrides: {
    root: {
      backgroundColor: design.Layer[1].Fill,
      ...handleBreakpoints({ padding: Padding.md }),
      '&:last-child': handleBreakpoints({ paddingBlockEnd: Padding.md }),
    },
  },
  variants: [
    {
      props: { size: 'small' },
      style: {
        ...handleBreakpoints({ padding: Padding.sm }),
        '&:last-child': handleBreakpoints({ paddingBlockEnd: Padding.sm }),
      },
    },
  ],
})
