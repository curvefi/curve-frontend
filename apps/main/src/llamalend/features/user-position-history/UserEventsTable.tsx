import { useState } from 'react'
import { SortingState } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { QueryProp } from '@ui-kit/types/util'
import { DEFAULT_SORT, USER_POSITION_HISTORY_COLUMNS } from './columns'
import { ParsedUserCollateralEvent } from './hooks/useUserCollateralEvents'
import { useUserPositionHistoryVisibility } from './hooks/useUserPositionHistoryVisibility'
import { RowExpandedPanel } from './RowExpandedPanel'

const { MaxHeight } = SizesAndSpaces

type UserEventsTableProps = {
  eventsQuery: QueryProp<ParsedUserCollateralEvent[]>
}

const pagination = { pageIndex: 0, pageSize: 50 }

export const UserEventsTable = ({ eventsQuery }: UserEventsTableProps) => {
  const { columnVisibility } = useUserPositionHistoryVisibility()
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORT)

  const table = useTable({
    query: eventsQuery,
    columns: USER_POSITION_HISTORY_COLUMNS,
    state: { columnVisibility, sorting },
    initialState: { pagination },
    onSortingChange: setSorting,
    ...getTableOptions(eventsQuery.data),
  })

  return (
    <DataTable
      table={table}
      emptyState={
        <EmptyStateRow table={table}>{table.error ? t`Could not load events` : t`No events found`}</EmptyStateRow>
      }
      maxHeight={MaxHeight.userEventsTable}
      expandedPanel={RowExpandedPanel}
    />
  )
}
