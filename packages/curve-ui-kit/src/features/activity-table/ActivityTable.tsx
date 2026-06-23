import type { Row, Table } from '@tanstack/react-table'
import type { TableItem, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import type { ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'

/** Default expanded panel that renders nothing (for tables without mobile expansion) */
const DefaultExpandedPanel = <T extends TableItem>(_props: { row: Row<T>; table: Table<T> }) => null

type ActivityTableProps<TData extends TableItem> = {
  table: TanstackTable<TData>
  emptyTitle: string
  errorTitle: string
  expandedPanel?: ExpandedPanel<TData>
}

export const ActivityTable = <TData extends TableItem>({
  table,
  emptyTitle,
  errorTitle,
  expandedPanel = DefaultExpandedPanel,
}: ActivityTableProps<TData>) => (
  <DataTable
    category="scrollable"
    table={table}
    emptyState={{ emptyTitle, errorTitle }}
    expandedPanel={expandedPanel}
  />
)
