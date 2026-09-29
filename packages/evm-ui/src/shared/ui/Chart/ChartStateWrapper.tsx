import type { ReactNode } from 'react'
import { ChartEmpty, type ChartEmptyState } from '@evm-ui/shared/ui/Chart/ChartEmpty'
import { ChartError, type ChartErrorState } from '@evm-ui/shared/ui/Chart/ChartError'
import { ChartLoading } from '@evm-ui/shared/ui/Chart/ChartLoading'
import type { Address } from '@primitives/address.utils'
import { ErrorBoundary } from '@ui/features/errors/ErrorBoundary'

type ChartStateWrapperProps = {
  height: number
  isLoading: boolean
  isEmpty?: boolean
  emptyState?: ChartEmptyState
  error?: Error | null
  errorState?: ChartErrorState
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
}: ChartStateWrapperProps) => {
  if (error) return <ChartError height={height} error={error} errorState={errorState} userAddress={userAddress} />
  if (isLoading) return <ChartLoading height={height} />
  if (isEmpty) return <ChartEmpty height={height} emptyState={emptyState} />

  return (
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
}
