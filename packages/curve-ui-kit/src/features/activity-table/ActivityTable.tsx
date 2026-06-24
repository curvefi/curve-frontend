import type { Row, Table } from '@tanstack/react-table'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable, DataTableProps } from '@ui-kit/shared/ui/DataTable/DataTable'

/** Default expanded panel that renders nothing (for tables without mobile expansion) */
const DefaultExpandedPanel = <T extends TableItem>(_props: { row: Row<T>; table: Table<T> }) => null

type ActivityTableProps<TData extends TableItem> = Pick<
  DataTableProps<TData>,
  'table' | 'emptyState' | 'errorState' | 'expandedPanel'
>

export const ActivityTable = <TData extends TableItem>({
  table,
  emptyState,
  errorState,
  expandedPanel = DefaultExpandedPanel,
}: ActivityTableProps<TData>) => (
  <DataTable
    category="scrollable"
    table={table}
    emptyState={emptyState}
    errorState={errorState}
    expandedPanel={expandedPanel}
  />
)
