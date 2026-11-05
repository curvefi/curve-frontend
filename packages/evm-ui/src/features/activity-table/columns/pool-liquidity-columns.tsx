import { AddressCell } from '@evm-ui/shared/ui/DataTable/inline-cells/AddressCell'
import { TimestampCell } from '@evm-ui/shared/ui/DataTable/inline-cells/TimestampCell'
import { scanAddressPath, scanTxPath } from '@legacy-ui/utils'
import { createAppColumnHelper } from '@ui/features/tables/data-table.utils'
import type { RowBreakdownConfig } from '@ui/features/tables/DataRow'
import { t } from '@ui/lib/i18n'
import { BreakdownActionLabel } from '../cells/BreakdownActionLabel'
import { PoolLiquidityActionCell } from '../cells/PoolLiquidityActionCell'
import { TokenDeltaAmountCell } from '../cells/TokenDeltaAmountCell'
import type { ActivityTokenDelta, PoolLiquidityRow } from '../types'
import { getPoolLiquidityEventAction, getPoolLiquidityEventTokenDeltas } from '../utils'

export enum PoolLiquidityColumnId {
  Action = 'eventType',
  TokenAmount = 'tokenAmount',
  User = 'provider',
  Time = 'time',
}

const columnHelper = createAppColumnHelper<PoolLiquidityRow>()

export const POOL_LIQUIDITY_COLUMNS = columnHelper.columns([
  columnHelper.accessor('provider', {
    id: PoolLiquidityColumnId.User,
    header: t`Address`,
    cell: ({ getValue, row }) => (
      <AddressCell address={getValue()} explorerUrl={scanAddressPath(row.original.chainId, row.original.provider)} />
    ),
  }),
  columnHelper.display({
    id: PoolLiquidityColumnId.Action,
    header: t`Action`,
    cell: ({ row }) => <PoolLiquidityActionCell event={row.original} />,
  }),
  columnHelper.display({
    id: PoolLiquidityColumnId.TokenAmount,
    header: t`Token amount`,
    cell: ({ row }) => <TokenDeltaAmountCell deltas={getPoolLiquidityEventTokenDeltas(row.original)} />,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('time', {
    id: PoolLiquidityColumnId.Time,
    header: t`Time`,
    cell: ({ row }) => (
      <TimestampCell
        timestamp={new Date(row.original.time)}
        txUrl={scanTxPath(row.original.chainId, row.original.txHash)}
        align="end"
      />
    ),
    meta: { type: 'numeric' },
  }),
])

/** One breakdown row per non-zero token when a liquidity event involves multiple tokens. */
export const POOL_LIQUIDITY_BREAKDOWN: RowBreakdownConfig<PoolLiquidityRow, ActivityTokenDelta> = {
  getItems: getPoolLiquidityEventTokenDeltas,
  getItemKey: ({ label }) => label,
  cells: {
    [PoolLiquidityColumnId.Action]: (_, event) => <BreakdownActionLabel {...getPoolLiquidityEventAction(event)} />,
    [PoolLiquidityColumnId.TokenAmount]: delta => <TokenDeltaAmountCell deltas={[delta]} />,
  },
}
