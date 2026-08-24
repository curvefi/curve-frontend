import { ReactNode } from 'react'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import type { SxProps } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'

const { Spacing } = SizesAndSpaces

type Props = {
  children?: ReactNode
  sx?: SxProps
}

// Not a generic separate component yet in evm-ui until it's used
// in more places and we have a better idea what to generalize.
export const TabPanel = ({ sx, children }: Props) => (
  <Stack
    role="tabpanel"
    sx={{
      gap: Spacing.md,
      backgroundColor: t => t.design.Layer[1].Fill,
      paddingBlockStart: Spacing.md,
      paddingBlockEnd: Spacing.lg,
      ...sx,
    }}
  >
    {children}
  </Stack>
)
