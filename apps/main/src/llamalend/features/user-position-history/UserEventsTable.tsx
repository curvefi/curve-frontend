import { useReactTable } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { DataTable, getTableOptions } from '@ui-kit/shared/ui/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { USER_POSITION_HISTORY_COLUMNS } from './columns'
import { ParsedUserLendCollateralEvent } from './hooks/useUserLendCollateralEvents'

type UserEventsTableProps = {
  events: ParsedUserLendCollateralEvent[]
  isError: boolean
  loading: boolean
}

export const UserEventsTable = ({ events, loading, isError }: UserEventsTableProps) => {
  const table = useReactTable({
    columns: USER_POSITION_HISTORY_COLUMNS,
    data: events,
    ...getTableOptions(events),
  })

  return (
    <DataTable
      table={table}
      emptyState={
        <EmptyStateRow table={table}>{isError ? t`Could not load events` : t`No events found`}</EmptyStateRow>
      }
      loading={loading}
      expandedPanel={() => null} // TODO: fix
      shouldStickFirstColumn={false} // TODO: fix
    />
  )
}
