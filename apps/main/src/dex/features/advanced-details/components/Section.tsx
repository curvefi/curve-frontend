import type { ReactNode } from 'react'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'

const { Spacing } = SizesAndSpaces

/** Small helper component for groups of action infos */
export const Section = ({ children }: { children: ReactNode }) => (
  <Stack sx={{ paddingBlock: Spacing.sm, '&:empty': { display: 'none' } }}>{children}</Stack>
)
