import { createColumnHelper } from '@tanstack/react-table'
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

export const LLAMMA_TRADES_COLUMNS = [
  columnHelper.accessor('buyer', {
    id: LlammaTradesColumnId.User,
    header: t`Address`,
    cell: ({ getValue }) => <AddressCell address={getValue()} />,
  }),
  columnHelper.accessor('amountBought', {
    id: LlammaTradesColumnId.Bought,
    header: t`Buy`,
    cell: ({ row }) => (
      <TokenAmountCell
        amount={row.original.amountBought}
        symbol={row.original.tokenBought.symbol}
        tokenAddress={row.original.tokenBought.address}
        chainId={row.original.network}
        align="right"
      />
    ),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('amountSold', {
    id: LlammaTradesColumnId.Sold,
    header: t`Sell`,
    cell: ({ row }) => (
      <TokenAmountCell
        amount={-row.original.amountSold}
        symbol={row.original.tokenSold.symbol}
        tokenAddress={row.original.tokenSold.address}
        chainId={row.original.network}
        align="right"
      />
    ),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('timestamp', {
    id: LlammaTradesColumnId.Time,
    header: t`Time`,
    cell: ({ row }) => <TimestampCell timestamp={row.original.timestamp} txUrl={row.original.txUrl} />,
    meta: { type: 'numeric' },
  }),
]
