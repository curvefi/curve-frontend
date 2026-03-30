/// <reference types="./mui-card-content.d.ts" />
import type { Components } from '@mui/material/styles'
import { DesignSystem } from '@ui-kit/themes/design'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { handleBreakpoints } from '../../basic-theme'

const { Spacing } = SizesAndSpaces

export const defineMuiCardContent = (design: DesignSystem): Components['MuiCardContent'] => ({
  styleOverrides: {
    root: {
      backgroundColor: design.Layer[1].Fill,
      ...handleBreakpoints({ padding: Spacing.md }),
      '&:last-child': handleBreakpoints({ paddingBlockEnd: Spacing.md }),
    },
  },
  variants: [
    {
      props: { size: 'small' },
      style: {
        ...handleBreakpoints({ padding: Spacing.sm }),
        '&:last-child': handleBreakpoints({ paddingBlockEnd: Spacing.sm }),
      },
    },
  ],
})
