import { DataTable, DataTableProps } from '@evm-ui/shared/ui/DataTable/DataTable'
import { ExpandedPanelActions } from '@evm-ui/shared/ui/DataTable/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@evm-ui/shared/ui/DataTable/ExpansionRow'
import { getTransactionActions } from './utils'

type ActivityTableItem = { chainId: number; txHash: string | null }

type ActivityTableProps<TData extends ActivityTableItem> = Pick<
  DataTableProps<TData>,
  'table' | 'emptyState' | 'errorState' | 'expandedPanel'
>

const DefaultExpandedPanelActions = <TData extends ActivityTableItem>({
  row: {
    original: { chainId, txHash },
  },
}: Parameters<ExpandedPanelComponent<TData>>[0]) => (
  <ExpandedPanelActions actions={getTransactionActions(chainId, txHash)} />
)

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
