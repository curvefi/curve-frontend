import { ActivityTable, MarketEventsExpandedPanel } from '@evm-ui/features/activity-table'
import { useLlammaActivityEventsConfig } from './hooks/useLlammaActivityEventsConfig'
import { LlammaActivityProps } from './'

export const LlammaActivityEvents = ({
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
    />
  )
}
