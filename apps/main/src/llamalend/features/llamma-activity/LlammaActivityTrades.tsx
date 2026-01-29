import { ActivityTable, LlammaTradesExpandedPanel } from '@ui-kit/features/activity-table'
import { useLlammaActivityTrades } from './hooks/useLlammaActivityTrades'
import { LlammaActivityProps } from './'

export type LlammaActivityTradesProps = Omit<LlammaActivityProps, 'borrowToken' | 'collateralToken'>

export const LlammaActivityTrades = ({
  isMarketAvailable,
  network,
  ammAddress,
  endpoint,
  networkConfig,
}: LlammaActivityTradesProps) => {
  const { tradesTableConfig } = useLlammaActivityTrades({
    isMarketAvailable,
    network,
    ammAddress,
    endpoint,
    networkConfig,
  })

  return <ActivityTable tableConfig={tradesTableConfig} expandedPanel={LlammaTradesExpandedPanel} />
}
