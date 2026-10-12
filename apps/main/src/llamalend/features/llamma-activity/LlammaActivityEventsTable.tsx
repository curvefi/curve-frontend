import { ActivityTable } from '@evm-ui/features/activity-table/ActivityTable'
import { LLAMMA_EVENTS_BREAKDOWN } from '@evm-ui/features/activity-table/columns/llamma-events-columns'
import { MarketEventsExpandedPanel } from '@evm-ui/features/activity-table/panels/MarketEventsExpandedPanel'
import { useLlammaActivityEventsConfig } from './hooks/useLlammaActivityEventsConfig'
import { LlammaActivityProps } from '.'

export const LlammaActivityEventsTable = ({
  chainId,
  blockchainId,
  collateralToken,
  borrowToken,
  ammAddress,
  endpoint,
}: LlammaActivityProps) => {
  const { table, emptyState, errorState } = useLlammaActivityEventsConfig({
    chainId,
    blockchainId,
    collateralToken,
    borrowToken,
    ammAddress,
    endpoint,
  })

  return (
    <ActivityTable
      table={table}
      emptyState={emptyState}
      errorState={errorState}
      expandedPanel={{ Body: MarketEventsExpandedPanel }}
      rowBreakdown={LLAMMA_EVENTS_BREAKDOWN}
    />
  )
}
