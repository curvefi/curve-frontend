import type { Components } from '@mui/material/styles'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { handleBreakpoints } from '../basic-theme'

const { Spacing } = SizesAndSpaces

export const defineMuiCardContent = (): Components['MuiCardContent'] => ({
  styleOverrides: {
    root: {
      ...handleBreakpoints({ padding: Spacing.md }),
      '&:last-child': handleBreakpoints({ padding: Spacing.md }),
    },
  },
})
