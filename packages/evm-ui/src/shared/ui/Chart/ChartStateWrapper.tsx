import type { ReactNode } from 'react'
import { ChartEmpty } from '@evm-ui/shared/ui/Chart/ChartEmpty'
import { ChartError } from '@evm-ui/shared/ui/Chart/ChartError'
import { ChartLoading } from '@evm-ui/shared/ui/Chart/ChartLoading'
import { ErrorBoundary } from '@evm-ui/widgets/ErrorBoundary'
import type { Address } from '@primitives/address.utils'
import type { ConnectionProps } from '@ui/components/ConnectWalletButton'

type ChartStateWrapperProps = ConnectionProps & {
  height: number
  isLoading: boolean
  isEmpty?: boolean
  emptyMessage?: ReactNode
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
  emptyMessage,
  error,
  errorMessage,
  refreshData,
  children,
  userAddress,
  ...connectionProps
}: ChartStateWrapperProps) => {
  if (isLoading) return <ChartLoading height={height} />
  if (error)
    return (
      <ChartError
        height={height}
        error={error}
        errorMessage={errorMessage}
        refreshData={refreshData}
        userAddress={userAddress}
        {...connectionProps}
      />
    )
  if (isEmpty) return <ChartEmpty height={height} message={emptyMessage} />

  return (
    <ErrorBoundary
      title="Chart Error"
      inline
      subtitle="Something went wrong when rendering the chart."
      refreshData={refreshData}
      userAddress={userAddress}
      {...connectionProps}
    >
      {children}
    </ErrorBoundary>
  )
}
