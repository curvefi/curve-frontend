import type { ExpandedPanelContext, TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable, DataTableProps } from '@ui-kit/shared/ui/DataTable/DataTable'
import { ExpandedPanelActions } from '@ui-kit/shared/ui/DataTable/ExpandedPanelActions'
import { getTransactionActions } from './utils'

type ActivityTableItem = TableItem & { txUrl?: string | null }

type ActivityTableProps<TData extends ActivityTableItem> = Pick<
  DataTableProps<TData>,
  'table' | 'emptyState' | 'errorState' | 'expandedPanel'
>

const DefaultExpandedPanelActions = <TData extends ActivityTableItem>({
  row: {
    original: { txUrl },
  },
}: ExpandedPanelContext<TData>) => <ExpandedPanelActions actions={getTransactionActions(txUrl)} />

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
        Actions: expandedPanel.Actions ?? DefaultExpandedPanelActions,
      }
    }
  />
)
