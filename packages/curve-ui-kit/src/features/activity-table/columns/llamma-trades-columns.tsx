import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { TokenAmountCell, TimestampCell, AddressCell } from '../cells'
import type { LlammaTradeRow } from '../types'

export enum LlammaTradesColumnId {
  User = 'buyer',
  Bought = 'amountBought',
  Sold = 'amountSold',
  Time = 'timestamp',
}

const columnHelper = createColumnHelper<LlammaTradeRow>()

export const createLlammaTradesColumns = (): ColumnDef<LlammaTradeRow, unknown>[] => [
  columnHelper.accessor('amountBought', {
    id: LlammaTradesColumnId.Bought,
    header: t`Bought`,
    cell: ({ row }) => (
      <TokenAmountCell
        amount={row.original.amountBought}
        symbol={row.original.tokenBought.symbol}
        tokenAddress={row.original.tokenBought.address}
        chainId={row.original.network}
      />
    ),
  }) as ColumnDef<LlammaTradeRow, unknown>,
  columnHelper.accessor('amountSold', {
    id: LlammaTradesColumnId.Sold,
    header: t`Sold`,
    cell: ({ row }) => (
      <TokenAmountCell
        amount={-row.original.amountSold}
        symbol={row.original.tokenSold.symbol}
        align="right"
        tokenAddress={row.original.tokenSold.address}
        chainId={row.original.network}
      />
    ),
    meta: { type: 'numeric' },
  }) as ColumnDef<LlammaTradeRow, unknown>,
  columnHelper.accessor('buyer', {
    id: LlammaTradesColumnId.User,
    header: t`Address`,
    cell: ({ getValue }) => <AddressCell address={getValue()} />,
    meta: { type: 'numeric' },
  }) as ColumnDef<LlammaTradeRow, unknown>,
  columnHelper.accessor('timestamp', {
    id: LlammaTradesColumnId.Time,
    header: t`Time`,
    cell: ({ row }) => <TimestampCell timestamp={row.original.timestamp} txUrl={row.original.url} />,
    meta: { type: 'numeric' },
  }) as ColumnDef<LlammaTradeRow, unknown>,
]
