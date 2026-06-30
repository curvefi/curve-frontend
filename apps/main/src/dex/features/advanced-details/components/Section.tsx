import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/** Small helper component for groups of action infos */
export const Section = ({ children }: { children: ReactNode }) => (
  <Stack sx={{ paddingBlock: Spacing.sm, '&:empty': { display: 'none' } }}>{children}</Stack>
)
