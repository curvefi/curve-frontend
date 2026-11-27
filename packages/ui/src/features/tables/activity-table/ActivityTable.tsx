import type { RowBreakdownConfig } from '@ui/features/tables/DataRow'
import { DataTable, DataTableProps } from '@ui/features/tables/DataTable'
import { ActivityExpandedPanel } from './ActivityExpandedPanel'
import { ActivityUsdValueCell } from './cells/ActivityUsdValueCell'
import { BreakdownActionLabelCell } from './cells/BreakdownActionLabelCell'
import { TokenDeltaAmountCell } from './cells/TokenDeltaAmountCell'
import { ActivityColumnId } from './columns/columns.enum'
import type { ActivityRow, ActivityTokenDelta } from './types'
import { getActivityDeltaKey } from './utils'

type ActivityTableProps = Pick<DataTableProps<ActivityRow>, 'table' | 'emptyState' | 'errorState'>

const ACTIVITY_BREAKDOWN: RowBreakdownConfig<ActivityRow, ActivityTokenDelta> = {
  getItems: ({ deltas }) => deltas,
  getItemKey: ({ label, token }, index) => getActivityDeltaKey(label, token?.address, index),
  cells: {
    [ActivityColumnId.Action]: ({ label }) => <BreakdownActionLabelCell label={label} />,
    [ActivityColumnId.Value]: ({ amount, amountUsd }, { timestamp }) =>
      // Allow amountUsd to be null for the 'processing' state
      amountUsd !== undefined && <ActivityUsdValueCell amount={amount} amountUsd={amountUsd} timestamp={timestamp} />,
    [ActivityColumnId.Amount]: (delta, { blockchainId }) => (
      <TokenDeltaAmountCell blockchainId={blockchainId} deltas={[delta]} />
    ),
  },
}

export const ActivityTable = ({ table, emptyState, errorState }: ActivityTableProps) => (
  <DataTable
    category="scrollable"
    table={table}
    emptyState={emptyState}
    errorState={errorState}
    rowBreakdown={ACTIVITY_BREAKDOWN}
    expandedPanel={{ Body: ActivityExpandedPanel }}
  />
)
