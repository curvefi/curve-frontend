import { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const Label = ({ children }: { children?: ReactNode }) => (
  <Typography variant="bodyMBold" color="text.secondary">
    {children}
  </Typography>
)

export const Setting = ({ children }: { children?: ReactNode }) => (
  <Stack direction="row" gap={Spacing.sm} justifyContent="space-between" alignItems="center">
    {children}
  </Stack>
)
