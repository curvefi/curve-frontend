import type { ReactNode } from 'react'
import { ErrorBoundary } from '@ui-kit/widgets/ErrorBoundary'
import { ChartEmpty } from './ChartEmpty'
import { ChartError } from './ChartError'
import { ChartLoading } from './ChartLoading'

type ChartStateWrapperProps = {
  height: number
  isLoading: boolean
  isEmpty?: boolean
  emptyTitle?: ReactNode
  emptyMessage?: ReactNode
  error?: Error | null
  errorMessage: string
  refetchFunction?: () => Promise<unknown> | void
  children: ReactNode
}

/** Renders loading spinner, error message, empty message, or chart content based on query state.
 * Wraps children in an ErrorBoundary to catch rendering errors. */
export const ChartStateWrapper = ({
  height,
  isLoading,
  isEmpty,
  emptyTitle,
  emptyMessage,
  error,
  errorMessage,
  refetchFunction,
  children,
}: ChartStateWrapperProps) => {
  if (isLoading) return <ChartLoading height={height} />
  if (error)
    return <ChartError height={height} error={error} errorMessage={errorMessage} refetchFunction={refetchFunction} />
  if (isEmpty) return <ChartEmpty height={height} title={emptyTitle} message={emptyMessage} />

  return (
    <ErrorBoundary
      title="Chart Error"
      inline
      subtitle="Something went wrong when rendering the chart."
      refreshData={refetchFunction}
    >
      {children}
    </ErrorBoundary>
  )
}
