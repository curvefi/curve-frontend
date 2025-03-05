import { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type Props = {
  children?: ReactNode
}

// Not a generic separate component yet in curve-ui-kit until it's used
// in more places and we have a better idea what to generalize.
export const TabPanel = ({ children }: Props) => (
  <Stack
    gap={Spacing.md}
    role="tabpanel"
    sx={{
      backgroundColor: (t) => t.design.Layer[1].Fill,
      paddingBlockStart: Spacing.md,
      paddingBlockEnd: Spacing.lg,
    }}
  >
    {children}
  </Stack>
)
