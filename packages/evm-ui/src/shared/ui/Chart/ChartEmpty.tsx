import type { ReactNode } from 'react'
import { t } from '@evm-ui/lib/i18n'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'
import { EmptyStateCard } from '../EmptyStateCard'

const { Spacing } = SizesAndSpaces

type ChartEmptyProps = {
  height: number
  message?: ReactNode
}

export const ChartEmpty = ({ height, message }: ChartEmptyProps) => (
  <Stack sx={{ alignItems: 'center', justifyContent: 'center', padding: Spacing.md, minHeight: height }}>
    <EmptyStateCard title={t`No chart data found`} description={message} />
  </Stack>
)
