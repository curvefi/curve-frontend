import { createAppColumnHelper } from '@ui/features/tables/data-table.utils'
import { ActivityActionCell } from '../cells/ActivityActionCell'
import { ActivityAddressCell } from '../cells/ActivityAddressCell'
import { ActivityTimeCell } from '../cells/ActivityTimeCell'
import { ActivityUsdValueCell } from '../cells/ActivityUsdValueCell'
import { TokenDeltaAmountCell } from '../cells/TokenDeltaAmountCell'
import { IndentBox } from '../IndentBox'
import type { ActivityRow } from '../types'
import { ActivityColumnId } from './columns.enum'
import { ACTIVITY_TITLES } from './columns.titles'

const columnHelper = createAppColumnHelper<ActivityRow>()

export const ACTIVITY_COLUMNS = columnHelper.columns([
  columnHelper.display({
    id: ActivityColumnId.Time,
    header: ACTIVITY_TITLES[ActivityColumnId.Time],
    cell: ActivityTimeCell,
  }),
  columnHelper.display({
    id: ActivityColumnId.Action,
    header: () => <IndentBox isColumnHeader>{ACTIVITY_TITLES[ActivityColumnId.Action]}</IndentBox>,
    cell: ActivityActionCell,
  }),
  columnHelper.display({
    id: ActivityColumnId.Value,
    header: ACTIVITY_TITLES[ActivityColumnId.Value],
    cell: ({
      row: {
        original: { deltas, timestamp, valueUsd },
      },
    }) =>
      valueUsd !== undefined && (
        <ActivityUsdValueCell amount={deltas[0]?.amount ?? 0} amountUsd={valueUsd} timestamp={timestamp} />
      ),
    meta: { type: 'numeric' },
  }),
  columnHelper.display({
    id: ActivityColumnId.Amount,
    header: ACTIVITY_TITLES[ActivityColumnId.Amount],
    cell: ({
      row: {
        original: { blockchainId, deltas },
      },
    }) => <TokenDeltaAmountCell blockchainId={blockchainId} deltas={deltas} />,
    meta: { type: 'numeric' },
  }),
  columnHelper.display({
    id: ActivityColumnId.Address,
    header: ACTIVITY_TITLES[ActivityColumnId.Address],
    cell: ActivityAddressCell,
    meta: { type: 'numeric' },
  }),
])
