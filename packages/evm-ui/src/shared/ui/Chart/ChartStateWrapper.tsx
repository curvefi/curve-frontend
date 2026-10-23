import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { AllOrNone } from '@primitives/objects.utils'
import { EmptyStateCard, type EmptyStateCardProps } from '@ui/components/EmptyStateCard'
import { Spinner } from '@ui/components/Spinner'
import type { ConnectionProps } from '@ui/features/connect-wallet/ConnectWalletButton'
import { ErrorBoundary } from '@ui/features/errors/ErrorBoundary'
import { ErrorMessage } from '@ui/features/errors/ErrorMessage'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export type ChartEmptyState = { testId?: string } & Pick<
  EmptyStateCardProps,
  'title' | 'description' | 'button' | 'secondaryButton'
>

export type ChartErrorState = { onReload?: () => Promise<unknown> | void } & Pick<
  EmptyStateCardProps,
  'title' | 'description'
>

export type ChartStateWrapperProps<T> = AllOrNone<ConnectionProps> & {
  query: QueryProp<T>
  height: number
  isEmpty?: boolean
  emptyState?: ChartEmptyState
  errorState?: ChartErrorState
  children: (data: T) => ReactNode
  userAddress?: Address
}

const Loading = ({ height }: { height: number }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: height }}>
    <Spinner />
  </Box>
)

export const ChartStateWrapper = <T,>({
  query: { data, isLoading, error },
  height,
  isEmpty,
  emptyState,
  errorState,
  children,
  userAddress,
  ...connectionProps
}: ChartStateWrapperProps<T>) =>
  isLoading ? (
    <Loading height={height} />
  ) : error ? (
    <Box
      data-testid="chart-error"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: height }}
    >
      <ErrorMessage
        title={errorState?.title ?? t`An error occurred`}
        subtitle={errorState?.description ?? error.message}
        error={error}
        refreshData={errorState?.onReload}
        userAddress={userAddress}
      />
    </Box>
  ) : isEmpty ? (
    <Stack sx={{ alignItems: 'center', justifyContent: 'center', padding: Spacing.md, minHeight: height }}>
      <EmptyStateCard {...connectionProps} {...emptyState} title={emptyState?.title ?? t`No chart data found`} />
    </Stack>
  ) : data === undefined ? (
    <Loading height={height} />
  ) : (
    <ErrorBoundary
      title="Chart Error"
      inline
      subtitle="Something went wrong when rendering the chart."
      refreshData={errorState?.onReload}
      userAddress={userAddress}
    >
      {children(data)}
    </ErrorBoundary>
  )
