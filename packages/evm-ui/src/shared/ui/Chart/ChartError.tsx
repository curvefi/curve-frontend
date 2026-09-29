import Box from '@mui/material/Box'
import type { Address } from '@primitives/address.utils'
import type { EmptyStateCardProps } from '@ui/components/EmptyStateCard'
import { ErrorMessage } from '@ui/features/errors/ErrorMessage'
import { t } from '@ui/lib/i18n'

export type ChartErrorState = Pick<EmptyStateCardProps, 'title' | 'description'> & {
  onReload?: () => Promise<unknown> | void
}

/** Error message component centered and wrapped in a container that takes a height prop and uses full width.
 * Optional callback for refreshing the chart data. */
export const ChartError = ({
  height,
  error,
  errorState,
  userAddress,
}: {
  height: number
  error: Error
  errorState?: ChartErrorState
  userAddress: Address | undefined
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: height }}>
    <ErrorMessage
      title={errorState?.title ?? t`An error occurred`}
      subtitle={errorState?.description ?? error.message}
      error={error}
      refreshData={errorState?.onReload}
      userAddress={userAddress}
    />
  </Box>
)
