import { AddressCell } from '@evm-ui/shared/ui/DataTable/inline-cells/AddressCell'
import { RelativeTimeCell } from '@evm-ui/shared/ui/DataTable/inline-cells/RelativeTimeCell'
import { scanAddressPath, scanTxPath } from '@legacy-ui/utils'
import { createAppColumnHelper } from '@ui/features/tables/data-table.utils'
import { ActivityActionCell } from '../cells/ActivityActionCell'
import { ActivityUsdValueCell } from '../cells/ActivityUsdValueCell'
import { TokenDeltaAmountCell } from '../cells/TokenDeltaAmountCell'
import type { ActivityRow } from '../types'
import { ActivityColumnId } from './columns.enum'
import { ACTIVITY_TITLES } from './columns.titles'

const columnHelper = createAppColumnHelper<ActivityRow>()

export const ACTIVITY_COLUMNS = columnHelper.columns([
  columnHelper.display({
    id: ActivityColumnId.Time,
    header: ACTIVITY_TITLES[ActivityColumnId.Time],
    cell: ({
      row: {
        original: { timestamp, chainId, txHash },
      },
    }) => <RelativeTimeCell timestamp={new Date(timestamp)} txUrl={txHash ? scanTxPath(chainId, txHash) : null} />,
  }),
  columnHelper.display({
    id: ActivityColumnId.Action,
    header: ACTIVITY_TITLES[ActivityColumnId.Action],
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
    cell: ({
      row: {
        original: { address, chainId },
      },
    }) => <AddressCell address={address} explorerUrl={scanAddressPath(chainId, address)} align="end" />,
    meta: { type: 'numeric' },
  }),
])
