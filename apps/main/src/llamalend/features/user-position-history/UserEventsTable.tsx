import { useState } from 'react'
import { useReactTable, SortingState } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { USER_POSITION_HISTORY_COLUMNS, DEFAULT_SORT } from './columns'
import { ParsedUserCollateralEvent } from './hooks/useUserCollateralEvents'
import { useUserPositionHistoryVisibility } from './hooks/useUserPositionHistoryVisibility'
import { RowExpandedPanel } from './RowExpandedPanel'

type UserEventsTableProps = {
  events: ParsedUserCollateralEvent[]
  isError: boolean
  loading: boolean
}

export const UserEventsTable = ({ events, loading, isError }: UserEventsTableProps) => {
  const { columnVisibility } = useUserPositionHistoryVisibility()
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORT)

  const table = useReactTable({
    data: events,
    columns: USER_POSITION_HISTORY_COLUMNS,
    state: { columnVisibility, sorting },
    onSortingChange: setSorting,
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
      expandedPanel={RowExpandedPanel}
      shouldStickFirstColumn={false}
    />
  )
}
