import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable, DataTableProps } from '@ui-kit/shared/ui/DataTable/DataTable'
import { getTransactionExpandedPanelActions } from './utils'

type ActivityTableItem = TableItem & { txUrl?: string | null }

type ActivityTableProps<TData extends ActivityTableItem> = Pick<
  DataTableProps<TData>,
  'table' | 'emptyState' | 'errorState' | 'expandedPanel'
>

export const ActivityTable = <TData extends ActivityTableItem>({
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
    expandedPanel={
      expandedPanel && {
        ...expandedPanel,
        getActions: expandedPanel.getActions ?? getTransactionExpandedPanelActions,
      }
    }
  />
)
