import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const CenteredEmptyState = ({ children }: { children: ReactNode }) => (
  <Stack sx={{ alignItems: 'center', paddingBlock: Spacing.md, backgroundColor: t => t.design.Layer[1].Fill }}>
    {children}
  </Stack>
)
