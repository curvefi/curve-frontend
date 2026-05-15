import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const SelectedFilterChips = ({ title, children }: { title: string; children: ReactNode }) => (
  <Stack gap={Spacing.xs}>
    <Typography variant="bodyXsRegular" color="textTertiary">
      {title}
    </Typography>
    <Stack direction="row" gap={Spacing.xs}>
      {children}
    </Stack>
  </Stack>
)
