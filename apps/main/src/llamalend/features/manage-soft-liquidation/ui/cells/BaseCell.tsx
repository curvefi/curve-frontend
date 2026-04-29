import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import type { SxProps, Theme } from '@mui/material/styles'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const BaseCell = ({ sx, children }: { sx?: SxProps<Theme>; children: ReactNode }) => (
  <Stack paddingBlock={Spacing.md} sx={sx}>
    {children}
  </Stack>
)
