import { AddressCell } from '@evm-ui/shared/ui/DataTable/inline-cells/AddressCell'
import { TimestampCell } from '@evm-ui/shared/ui/DataTable/inline-cells/TimestampCell'
import { scanAddressPath, scanTxPath } from '@legacy-ui/utils'
import type { RowData } from '@tanstack/react-table'
import { createAppColumnHelper } from '@ui/features/tables/data-table.utils'
import { RowBreakdownConfig } from '@ui/features/tables/DataRow'
import { t } from '@ui/lib/i18n'
import { BreakdownActionLabel } from '../cells/BreakdownActionLabel'
import { LlammaEventActionCell } from '../cells/LlammaEventActionCell'
import { TokenDeltaAmountCell } from '../cells/TokenDeltaAmountCell'
import { TokenDeltaUsdCell } from '../cells/TokenDeltaUsdCell'
import type { ActivityTokenDelta, MarketEventRow } from '../types'
import { getLlammaEventAction, getLlammaEventTokenDeltas } from '../utils'

export enum LlammaEventsColumnId {
  Action = 'action',
  TokenAmount = 'tokenAmount',
  UsdValue = 'usdValue',
  User = 'provider',
  Time = 'timestamp',
}

const columnHelper = createAppColumnHelper<MarketEventRow>()
const createRowBreakdown = <TData extends RowData, TItem>(config: RowBreakdownConfig<TData, TItem>) => config

export const LLAMMA_EVENTS_COLUMNS = columnHelper.columns([
  columnHelper.accessor('provider', {
    id: LlammaEventsColumnId.User,
    header: t`Address`,
    cell: ({ row }) => (
      <AddressCell
        address={row.original.provider}
        explorerUrl={scanAddressPath(row.original.chainId, row.original.provider)}
      />
    ),
  }),
  columnHelper.display({
    id: LlammaEventsColumnId.Action,
    header: t`Action`,
    cell: ({ row }) => <LlammaEventActionCell event={row.original} />,
  }),
  columnHelper.display({
    id: LlammaEventsColumnId.TokenAmount,
    header: t`Token amount`,
    cell: ({ row }) => <TokenDeltaAmountCell deltas={getLlammaEventTokenDeltas(row.original)} />,
    meta: { type: 'numeric' },
  }),
  columnHelper.display({
    id: LlammaEventsColumnId.UsdValue,
    header: t`USD value`,
    cell: ({ row }) => <TokenDeltaUsdCell deltas={getLlammaEventTokenDeltas(row.original)} />,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('timestamp', {
    id: LlammaEventsColumnId.Time,
    header: t`Time`,
    cell: ({ row }) => (
      <TimestampCell
        timestamp={new Date(row.original.timestamp)}
        txUrl={scanTxPath(row.original.chainId, row.original.txHash)}
        align="end"
      />
    ),
    meta: { type: 'numeric' },
  }),
])

/** One row per token when a LLAMMA event deltas multiple tokens, e.g. a withdrawal of collateral and borrowed tokens */
export const LLAMMA_EVENTS_BREAKDOWN = createRowBreakdown<MarketEventRow, ActivityTokenDelta>({
  getItems: getLlammaEventTokenDeltas,
  getItemKey: ({ label }) => label,
  cells: {
    [LlammaEventsColumnId.Action]: (_, event) => <BreakdownActionLabel {...getLlammaEventAction(event)} />,
    [LlammaEventsColumnId.TokenAmount]: delta => <TokenDeltaAmountCell deltas={[delta]} />,
    [LlammaEventsColumnId.UsdValue]: delta => <TokenDeltaUsdCell deltas={[delta]} />,
  },
})
