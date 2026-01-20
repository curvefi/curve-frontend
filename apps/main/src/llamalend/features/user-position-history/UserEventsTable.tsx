import { useState } from 'react'
import { SortingState } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DEFAULT_SORT } from './columns'
import { USER_POSITION_HISTORY_COLUMNS } from './columns'
import { ParsedUserCollateralEvent } from './hooks/useUserCollateralEvents'
import { useUserPositionHistoryVisibility } from './hooks/useUserPositionHistoryVisibility'
import { RowExpandedPanel } from './RowExpandedPanel'

const { MaxHeight } = SizesAndSpaces

type UserEventsTableProps = {
  events: ParsedUserCollateralEvent[]
  isError: boolean
  loading: boolean
}

const pagination = { pageIndex: 0, pageSize: 50 }

export const UserEventsTable = ({ events, loading, isError }: UserEventsTableProps) => {
  const { columnVisibility } = useUserPositionHistoryVisibility()
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORT)

  const table = useTable({
    data: events,
    columns: USER_POSITION_HISTORY_COLUMNS,
    state: { columnVisibility, sorting },
    initialState: { pagination },
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
      maxHeight={MaxHeight.userEventsTable}
      expandedPanel={RowExpandedPanel}
      shouldStickFirstColumn={false}
    />
  )
}
