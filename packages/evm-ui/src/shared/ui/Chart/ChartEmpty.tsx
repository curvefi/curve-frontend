import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { EmptyStateEvmCard, type EmptyStateEvmCardProps } from '../EmptyStateEvmCard'

const { Spacing } = SizesAndSpaces

export type ChartEmptyState = Pick<
  EmptyStateEvmCardProps,
  'title' | 'description' | 'button' | 'secondaryButton' | 'size' | 'testId'
>

export const ChartEmpty = ({ height, emptyState }: { height: number; emptyState?: ChartEmptyState }) => (
  <Stack sx={{ alignItems: 'center', justifyContent: 'center', padding: Spacing.md, minHeight: height, width: '100%' }}>
    <EmptyStateEvmCard {...emptyState} title={emptyState?.title ?? t`No chart data found`} />
  </Stack>
)
