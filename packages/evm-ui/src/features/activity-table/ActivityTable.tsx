import { EvmDataTable, type EvmDataTableProps } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import { ExpandedPanelActions } from '@ui/features/tables/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { getTransactionActions } from './utils'

type ActivityTableItem = { chainId: number; txHash: string | null }

type ActivityTableProps<TData extends ActivityTableItem> = Pick<
  EvmDataTableProps<TData>,
  'table' | 'emptyState' | 'errorState' | 'expandedPanel' | 'rowBreakdown'
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
  rowBreakdown,
}: ActivityTableProps<TData>) => (
  <EvmDataTable
    category="scrollable"
    table={table}
    emptyState={emptyState}
    errorState={errorState}
    rowBreakdown={rowBreakdown}
    expandedPanel={expandedPanel && { ...expandedPanel, Actions: expandedPanel.Actions ?? DefaultExpandedPanelActions }}
  />
)
