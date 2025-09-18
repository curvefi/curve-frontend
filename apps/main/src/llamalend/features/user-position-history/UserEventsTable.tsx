import { useReactTable } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { USER_POSITION_HISTORY_COLUMNS } from './columns'
import { ParsedUserCollateralEvent } from './hooks/useUserCollateralEvents'

type UserEventsTableProps = {
  events: ParsedUserCollateralEvent[]
  isError: boolean
  loading: boolean
}

export const UserEventsTable = ({ events, loading, isError }: UserEventsTableProps) => {
  const table = useReactTable({
    data: events,
    columns: USER_POSITION_HISTORY_COLUMNS,
    ...getTableOptions(events),
  })

  return (
    <DataTable
      table={table}
      emptyState={
        <EmptyStateRow table={table}>{isError ? t`Could not load events` : t`No events found`}</EmptyStateRow>
      }
      loading={loading}
      options={{
        maxHeight: '462px',
        disableStickyHeader: true,
      }}
      expandedPanel={() => null} // TODO: fix
      shouldStickFirstColumn={false} // TODO: fix
    />
  )
}
