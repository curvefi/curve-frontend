import { ActivityTable, LlammaEventsExpandedPanel } from '@ui-kit/features/activity-table'
import { useLlammaActivityEventsConfig } from './hooks/useLlammaActivityEventsConfig'
import { LlammaActivityProps } from './'

export const LlammaActivityEvents = ({
  isMarketAvailable,
  network,
  collateralToken,
  borrowToken,
  ammAddress,
  endpoint,
  networkConfig,
}: LlammaActivityProps) => {
  const { table, isLoading, isError, emptyMessage, errorMessage } = useLlammaActivityEventsConfig({
    isMarketAvailable,
    network,
    collateralToken,
    borrowToken,
    ammAddress,
    endpoint,
    networkConfig,
  })

  return (
    <ActivityTable
      table={table}
      isLoading={isLoading}
      isError={isError}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      expandedPanel={LlammaEventsExpandedPanel}
    />
  )
}
