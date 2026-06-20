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
  const { table, emptyTitle, errorTitle } = useLlammaActivityEventsConfig({
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
      emptyTitle={emptyTitle}
      errorTitle={errorTitle}
      expandedPanel={LlammaEventsExpandedPanel}
    />
  )
}
