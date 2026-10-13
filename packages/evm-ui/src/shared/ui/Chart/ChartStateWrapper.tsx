import type { ReactNode } from 'react'
import { EmptyStateEvmCard, type EmptyStateEvmCardProps } from '@evm-ui/shared/ui/EmptyStateEvmCard'
import type { Address } from '@primitives/address.utils'
import type { EmptyStateCardProps } from '@ui/components/EmptyStateCard'
import { Spinner } from '@ui/components/Spinner'
import { ErrorBoundary } from '@ui/features/errors/ErrorBoundary'
import { ErrorMessage } from '@ui/features/errors/ErrorMessage'
import { t } from '@ui/lib/i18n'
import Stack from '@mui/material/Stack'

type ChartStateWrapperProps = {
  height: number
  isLoading: boolean
  isEmpty?: boolean
  emptyState?: Pick<EmptyStateEvmCardProps, 'title' | 'description' | 'button' | 'secondaryButton' | 'size' | 'testId'>
  error?: Error | null
  errorState?: Pick<EmptyStateCardProps, 'title' | 'description'> & { onReload?: () => Promise<unknown> | void }
  children: ReactNode
  userAddress?: Address
}

/** Renders loading spinner, error message, empty message, or chart content based on query state.
 * Wraps children in an ErrorBoundary to catch rendering errors. */
export const ChartStateWrapper = ({
  height,
  isLoading,
  isEmpty,
  emptyState,
  error,
  errorState,
  children,
  userAddress,
}: ChartStateWrapperProps) =>
  error || isLoading || isEmpty ? (
    <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: height }}>
      {error ? (
        <ErrorMessage
          title={errorState?.title ?? t`An error occurred`}
          subtitle={errorState?.description ?? error.message}
          error={error}
          refreshData={errorState?.onReload}
          userAddress={userAddress}
        />
      ) : isLoading ? (
        <Spinner />
      ) : (
        <EmptyStateEvmCard {...emptyState} title={emptyState?.title ?? t`No chart data found`} />
      )}
    </Stack>
  ) : (
    <ErrorBoundary
      title="Chart Error"
      inline
      subtitle="Something went wrong when rendering the chart."
      refreshData={errorState?.onReload}
      userAddress={userAddress}
    >
      {children}
    </ErrorBoundary>
  )
