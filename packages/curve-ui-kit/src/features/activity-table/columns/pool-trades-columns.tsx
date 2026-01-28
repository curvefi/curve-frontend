import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { TokenAmountCell, TimestampCell, AddressCell } from '../cells'
import type { PoolTradeRow } from '../types'

export enum PoolTradesColumnId {
  Bought = 'tokensBought',
  Sold = 'tokensSold',
  User = 'buyer',
  Time = 'time',
}

const columnHelper = createColumnHelper<PoolTradeRow>()

export const createPoolTradesColumns = (): ColumnDef<PoolTradeRow, unknown>[] => [
  columnHelper.accessor('buyer', {
    id: PoolTradesColumnId.User,
    header: t`Address`,
    cell: ({ getValue }) => <AddressCell address={getValue()} />,
  }) as ColumnDef<PoolTradeRow, unknown>,
  columnHelper.accessor('tokensBought', {
    id: PoolTradesColumnId.Bought,
    header: t`Buy`,
    cell: ({ row }) => (
      <TokenAmountCell
        amount={row.original.tokensBought}
        symbol={row.original.tokenBought.symbol}
        amountUsd={row.original.tokensBoughtUsd}
        tokenAddress={row.original.tokenBought.address}
        chainId={row.original.network}
        align="right"
      />
    ),
    meta: { type: 'numeric' },
  }) as ColumnDef<PoolTradeRow, unknown>,
  columnHelper.accessor('tokensSold', {
    id: PoolTradesColumnId.Sold,
    header: t`Sell`,
    cell: ({ row }) => (
      <TokenAmountCell
        amount={-row.original.tokensSold}
        symbol={row.original.tokenSold.symbol}
        amountUsd={row.original.tokensSoldUsd ? -row.original.tokensSoldUsd : undefined}
        align="right"
        tokenAddress={row.original.tokenSold.address}
        chainId={row.original.network}
      />
    ),
    meta: { type: 'numeric' },
  }) as ColumnDef<PoolTradeRow, unknown>,
  columnHelper.accessor('time', {
    id: PoolTradesColumnId.Time,
    header: t`Time`,
    cell: ({ row }) => <TimestampCell timestamp={row.original.time} txUrl={row.original.txUrl} />,
    meta: { type: 'numeric' },
  }) as ColumnDef<PoolTradeRow, unknown>,
]
