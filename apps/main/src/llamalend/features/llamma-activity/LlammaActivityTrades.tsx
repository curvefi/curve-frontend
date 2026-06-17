import { ActivityTable, LlammaTradesExpandedPanel } from '@ui-kit/features/activity-table'
import { useLlammaActivityTradesConfig } from './hooks/useLlammaActivityTradesConfig'
import { LlammaActivityProps } from './'

export type LlammaActivityTradesProps = LlammaActivityProps

export const LlammaActivityTrades = (props: LlammaActivityTradesProps) => {
  const { table, isLoading, isError, emptyMessage, errorMessage } = useLlammaActivityTradesConfig(props)

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
