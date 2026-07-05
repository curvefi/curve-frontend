import {
  ActivityTable,
  LlammaEventsExpandedPanel,
  LlammaEventsExpandedPanelFooter,
} from '@ui-kit/features/activity-table'
import { useLlammaActivityEventsConfig } from './hooks/useLlammaActivityEventsConfig'
import { LlammaActivityProps } from './'

export const LlammaActivityEvents = ({
  network,
  collateralToken,
  borrowToken,
  ammAddress,
  endpoint,
  networkConfig,
}: LlammaActivityProps) => {
  const { table, emptyState, errorState } = useLlammaActivityEventsConfig({
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
      emptyState={emptyState}
      errorState={errorState}
      expandedPanel={{ body: LlammaEventsExpandedPanel, footer: LlammaEventsExpandedPanelFooter }}
    />
  )
}
