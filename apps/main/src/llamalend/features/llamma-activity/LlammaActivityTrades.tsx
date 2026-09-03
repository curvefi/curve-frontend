import { ActivityTable, MarketTradesExpandedPanel } from '@evm-ui/features/activity-table'
import { useLlammaActivityTradesConfig } from './hooks/useLlammaActivityTradesConfig'
import { LlammaActivityProps } from './'

export type LlammaActivityTradesProps = Omit<LlammaActivityProps, 'borrowToken' | 'collateralToken'>

export const LlammaActivityTrades = ({ chainId, blockchainId, ammAddress, endpoint }: LlammaActivityTradesProps) => {
  const { table, emptyState, errorState } = useLlammaActivityTradesConfig({
    chainId,
    blockchainId,
    ammAddress,
    endpoint,
  })

  return (
    <ActivityTable
      table={table}
      emptyState={emptyState}
      errorState={errorState}
      expandedPanel={{ Body: MarketTradesExpandedPanel }}
    />
  )
}
