import { ActivityTable, LlammaEventsExpandedPanel } from '@ui-kit/features/activity-table'
import { useLlammaActivityEventsConfig } from './hooks/useLlammaActivityEventsConfig'
import { LlammaActivityProps } from './'

export const LlammaActivityEvents = (props: LlammaActivityProps) => {
  const { table, isLoading, isError, emptyMessage, errorMessage } = useLlammaActivityEventsConfig(props)

  return (
    <ActivityTable
      table={table}
      isLoading={isLoading}
      isError={isError}
      emptyMessage={emptyMessage}
      errorMessage={errorMessage}
      expandedPanel={LlammaEventsExpandedPanel}
    />
  )
}
