import { ActivityTable, LlammaTradesExpandedPanel } from '@ui-kit/features/activity-table'
import { useLlammaActivityTrades } from './hooks/useLlammaActivityTrades'
import { LlammaActivityProps } from './'

export type LlammaActivityTradesProps = Omit<LlammaActivityProps, 'borrowToken' | 'collateralToken'>

export const LlammaActivityTrades = ({ network, ammAddress, endpoint, networkConfig }: LlammaActivityTradesProps) => {
  const { tradesTableConfig } = useLlammaActivityTrades({
    network,
    ammAddress,
    endpoint,
    networkConfig,
  })

  return <ActivityTable tableConfig={tradesTableConfig} expandedPanel={LlammaTradesExpandedPanel} />
}
