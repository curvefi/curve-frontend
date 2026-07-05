import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable, DataTableProps } from '@ui-kit/shared/ui/DataTable/DataTable'

type ActivityTableProps<TData extends TableItem> = Pick<
  DataTableProps<TData>,
  'table' | 'emptyState' | 'errorState' | 'expandedPanel'
>

export const ActivityTable = <TData extends TableItem>({
  table,
  emptyState,
  errorState,
  expandedPanel,
}: ActivityTableProps<TData>) => (
  <DataTable
    category="scrollable"
    table={table}
    emptyState={emptyState}
    errorState={errorState}
    expandedPanel={expandedPanel}
  />
)
