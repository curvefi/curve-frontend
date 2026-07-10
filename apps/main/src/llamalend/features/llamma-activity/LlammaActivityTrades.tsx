import { ActivityTable, LlammaTradesExpandedPanel } from '@ui-kit/features/activity-table'
import { useLlammaActivityTradesConfig } from './hooks/useLlammaActivityTradesConfig'
import { LlammaActivityProps } from './'

export type LlammaActivityTradesProps = Omit<LlammaActivityProps, 'borrowToken' | 'collateralToken'>

export const LlammaActivityTrades = ({ network, ammAddress, endpoint, networkConfig }: LlammaActivityTradesProps) => {
  const { table, emptyState, errorState } = useLlammaActivityTradesConfig({
    network,
    ammAddress,
    endpoint,
    networkConfig,
  })

  return (
    <ActivityTable
      table={table}
      emptyState={emptyState}
      errorState={errorState}
      expandedPanel={{ Body: LlammaTradesExpandedPanel }}
    />
  )
}
