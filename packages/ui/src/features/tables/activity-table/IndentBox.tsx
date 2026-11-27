import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import { handleBreakpoints } from '@ui/features/themes/basic-theme'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing, IconSize } = SizesAndSpaces

/** Indendation logic for column header and cells for all activity table rows, regardless of expansion feature. */
export const IndentBox = ({ children, isColumnHeader }: { children: ReactNode; isColumnHeader?: boolean }) => (
  <Box
    sx={{
      ...handleBreakpoints({ '--gap': Spacing[isColumnHeader ? 'sm' : 'xs'], '--icon-size': IconSize.md }),
      marginInlineStart: { tablet: 'calc(var(--gap) + var(--icon-size))' },
    }}
  >
    {children}
  </Box>
)
