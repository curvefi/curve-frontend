import type { ReactNode } from 'react'
import { ErrorBoundary } from '@ui-kit/widgets/ErrorBoundary'
import { ChartEmpty } from './ChartEmpty'
import { ChartError } from './ChartError'
import { ChartLoading } from './ChartLoading'

type ChartStateWrapperProps = {
  height: number
  isLoading: boolean
  isEmpty?: boolean
  emptyMessage?: ReactNode
  error?: Error | null
  errorMessage: string
  refreshData?: () => Promise<unknown> | void
  children: ReactNode
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
}: ChartStateWrapperProps) => {
  if (isLoading) return <ChartLoading height={height} />
  if (error) return <ChartError height={height} error={error} errorMessage={errorMessage} refreshData={refreshData} />
  if (isEmpty) return <ChartEmpty height={height} message={emptyMessage} />

  return (
    <ErrorBoundary
      title="Chart Error"
      inline
      subtitle="Something went wrong when rendering the chart."
      refreshData={refreshData}
    >
      {children}
    </ErrorBoundary>
  )
}
