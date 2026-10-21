import type { ReactNode } from 'react'
import { ChartEmpty } from '@evm-ui/shared/ui/Chart/ChartEmpty'
import { ChartError } from '@evm-ui/shared/ui/Chart/ChartError'
import { ChartLoading } from '@evm-ui/shared/ui/Chart/ChartLoading'
import type { Address } from '@primitives/address.utils'
import { ErrorBoundary } from '@ui/features/errors/ErrorBoundary'

type ChartStateWrapperProps = {
  height: number
  isLoading: boolean
  isEmpty?: boolean
  emptyTitle?: ReactNode
  emptyMessage?: ReactNode
  emptyTestId?: string
  error?: Error | null
  errorMessage: string
  refreshData?: () => Promise<unknown> | void
  children: ReactNode
  userAddress?: Address
}

/** Renders loading spinner, error message, empty message, or chart content based on query state.
 * Wraps children in an ErrorBoundary to catch rendering errors. */
export const ChartStateWrapper = ({
  height,
  isLoading,
  isEmpty,
  emptyTitle,
  emptyMessage,
  emptyTestId,
  error,
  errorMessage,
  refreshData,
  children,
  userAddress,
}: ChartStateWrapperProps) =>
  isLoading ? (
    <ChartLoading height={height} />
  ) : error ? (
    <ChartError
      height={height}
      error={error}
      errorMessage={errorMessage}
      refreshData={refreshData}
      userAddress={userAddress}
    />
  ) : isEmpty ? (
    <ChartEmpty height={height} title={emptyTitle} message={emptyMessage} testId={emptyTestId} />
  ) : (
    <ErrorBoundary
      title="Chart Error"
      inline
      subtitle="Something went wrong when rendering the chart."
      refreshData={refreshData}
      userAddress={userAddress}
    >
      {children}
    </ErrorBoundary>
  )
