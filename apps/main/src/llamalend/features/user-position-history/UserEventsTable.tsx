import { useState } from 'react'
import { SortingState } from '@tanstack/react-table'
import { getTransactionActions } from '@ui-kit/features/activity-table'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { ExpandedPanelActions } from '@ui-kit/shared/ui/DataTable/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import type { QueryProp } from '@ui-kit/types/util'
import { DEFAULT_SORT, USER_POSITION_HISTORY_COLUMNS } from './columns'
import { ParsedUserCollateralEvent } from './hooks/useUserCollateralEvents'
import { useUserPositionHistoryVisibility } from './hooks/useUserPositionHistoryVisibility'
import { RowExpandedPanel } from './RowExpandedPanel'

type UserEventsTableProps = {
  eventsQuery: QueryProp<ParsedUserCollateralEvent[]>
}

const pagination = { pageIndex: 0, pageSize: 50 }

const RowExpandedPanelActions: ExpandedPanelComponent<ParsedUserCollateralEvent> = ({ row: { original: event } }) => (
  <ExpandedPanelActions actions={getTransactionActions(event.url)} />
)

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
      category="scrollable"
      table={table}
      emptyState={{ title: t`No events found` }}
      errorState={{ title: t`Could not load events` }}
      expandedPanel={{ Body: RowExpandedPanel, Actions: RowExpandedPanelActions }}
    />
  )
}
