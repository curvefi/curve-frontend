import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { EmptyStateEvmCard } from '../EmptyStateEvmCard'

const { Spacing } = SizesAndSpaces

export const ChartEmpty = ({
  height,
  title = t`No chart data found`,
  message,
  testId,
}: {
  height: number
  title?: ReactNode
  message?: ReactNode
  testId?: string
}) => (
  <Stack sx={{ alignItems: 'center', justifyContent: 'center', padding: Spacing.md, minHeight: height }}>
    <EmptyStateEvmCard title={title} description={message} testId={testId} />
  </Stack>
)
