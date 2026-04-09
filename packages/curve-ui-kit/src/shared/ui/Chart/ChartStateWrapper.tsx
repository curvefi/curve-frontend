import type { ReactNode } from 'react'
import { ErrorBoundary } from '@ui-kit/widgets/ErrorBoundary'
import { ChartError } from './ChartError'
import { ChartLoading } from './ChartLoading'

type ChartStateWrapperProps = {
  height: number
  isLoading: boolean
  error?: Error | null
  errorMessage: string
  refetchFunction?: () => void
  children: ReactNode
}

/** Renders loading spinner, error message, or chart content based on query state.
 * Wraps children in an ErrorBoundary to catch rendering errors. */
export const ChartStateWrapper = ({
  height,
  isLoading,
  error,
  errorMessage,
  refetchFunction,
  children,
}: ChartStateWrapperProps) => {
  if (isLoading) return <ChartLoading height={height} />
  if (error) return <ChartError height={height} errorMessage={errorMessage} refetchFunction={refetchFunction} />
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
