import { ActivityTable, LlammaTradesExpandedPanel } from '@ui-kit/features/activity-table'
import { useLlammaActivityTradesConfig } from './hooks/useLlammaActivityTradesConfig'
import { LlammaActivityProps } from './'

export type LlammaActivityTradesProps = Omit<LlammaActivityProps, 'borrowToken' | 'collateralToken'>

export const LlammaActivityTrades = ({
  isMarketAvailable,
  network,
  ammAddress,
  endpoint,
  networkConfig,
}: LlammaActivityTradesProps) => {
  const { table, emptyTitle, errorTitle } = useLlammaActivityTradesConfig({
    isMarketAvailable,
    network,
    ammAddress,
    endpoint,
    networkConfig,
  })

  return (
    <ActivityTable
      table={table}
      emptyTitle={emptyTitle}
      errorTitle={errorTitle}
      expandedPanel={LlammaTradesExpandedPanel}
    />
  )
}
