import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const TableSelectedFilterChips = ({
  title,
  children,
  testId,
}: {
  title: ReactNode
  children: ReactNode
  testId?: string
}) => (
  <Stack sx={{ gap: Spacing.xs }} data-testid={testId}>
    <Typography variant="bodyXsRegular" color="textTertiary">
      {title}
    </Typography>
    <Stack direction="row" sx={{ gap: Spacing.xs }}>
      {children}
    </Stack>
  </Stack>
)
