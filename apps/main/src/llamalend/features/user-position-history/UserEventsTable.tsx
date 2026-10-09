import { useState } from 'react'
import { getTransactionActions } from '@evm-ui/features/activity-table'
import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import { SortingState } from '@tanstack/react-table'
import type { QueryProp } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { ExpandedPanelActions } from '@ui/features/tables/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { t } from '@ui/lib/i18n'
import { USER_POSITION_HISTORY_COLUMNS } from './columns/column.definitions'
import { DEFAULT_SORT } from './columns/columns.constants'
import { ParsedUserCollateralEvent } from './hooks/useUserCollateralEvents'
import { useUserPositionHistoryVisibility } from './hooks/useUserPositionHistoryVisibility'
import { RowExpandedPanel } from './RowExpandedPanel'

type UserEventsTableProps = { eventsQuery: QueryProp<ParsedUserCollateralEvent[]> }

const pagination = { pageIndex: 0, pageSize: 50 }

const RowExpandedPanelActions: ExpandedPanelComponent<ParsedUserCollateralEvent> = ({ row: { original: event } }) => (
  <ExpandedPanelActions actions={getTransactionActions(event.chainId, event.txHash)} />
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
    <EvmDataTable
      category="scrollable"
      table={table}
      emptyState={{ title: t`No events found` }}
      errorState={{ title: t`Could not load events` }}
      expandedPanel={{ Body: RowExpandedPanel, Actions: RowExpandedPanelActions }}
    />
  )
}
