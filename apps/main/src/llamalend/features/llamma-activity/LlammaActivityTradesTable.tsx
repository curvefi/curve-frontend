import { ActivityTable } from '@evm-ui/features/activity-table/ActivityTable'
import { MarketTradesExpandedPanel } from '@evm-ui/features/activity-table/panels/MarketTradesExpandedPanel'
import { useLlammaActivityTradesConfig } from './hooks/useLlammaActivityTradesConfig'
import type { LlammaActivityProps } from './types'

export const LlammaActivityTradesTable = (props: LlammaActivityProps) => {
  const { table, emptyState, errorState } = useLlammaActivityTradesConfig(props)

  return (
    <ActivityTable
      table={table}
      emptyState={emptyState}
      errorState={errorState}
      expandedPanel={{ Body: MarketTradesExpandedPanel }}
    />
  )
}
