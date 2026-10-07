import type { ReactNode } from 'react'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const MigrationTableDescription = ({ children }: { children: ReactNode }) => (
  <Typography variant="bodyMRegular" sx={{ paddingBlock: Spacing.md, paddingInline: Spacing.md }}>
    {children}
  </Typography>
)
