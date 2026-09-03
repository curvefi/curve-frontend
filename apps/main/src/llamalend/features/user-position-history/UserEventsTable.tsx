import { useState } from 'react'
import { getTransactionActions } from '@evm-ui/features/activity-table'
import { t } from '@evm-ui/lib/i18n'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import { ExpandedPanelActions } from '@evm-ui/shared/ui/DataTable/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@evm-ui/shared/ui/DataTable/ExpansionRow'
import { SortingState } from '@tanstack/react-table'
import type { QueryProp } from '@ui/features/queries/util'
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

  const table = useCurveTable({
    query: eventsQuery,
    columns: USER_POSITION_HISTORY_COLUMNS,
    state: { columnVisibility, sorting },
    initialState: { pagination },
    onSortingChange: setSorting,
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
