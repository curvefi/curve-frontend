import { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { SxProps } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

interface Props {
  children?: ReactNode
  sx?: SxProps
}

// Not a generic separate component yet in curve-ui-kit until it's used
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
