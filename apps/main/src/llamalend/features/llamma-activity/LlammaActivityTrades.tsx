import { ActivityTable, LlammaTradesExpandedPanel } from '@ui-kit/features/activity-table'
import { useLlammaActivityTradesConfig } from './hooks/useLlammaActivityTradesConfig'
import { LlammaActivityProps } from './'

export type LlammaActivityTradesProps = Omit<LlammaActivityProps, 'borrowToken' | 'collateralToken'>

export const LlammaActivityTrades = ({ network, ammAddress, endpoint, networkConfig }: LlammaActivityTradesProps) => {
  const { table, isLoading, isError, emptyMessage, errorMessage } = useLlammaActivityTradesConfig({
    network,
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
      expandedPanel={LlammaTradesExpandedPanel}
    />
  )
}
