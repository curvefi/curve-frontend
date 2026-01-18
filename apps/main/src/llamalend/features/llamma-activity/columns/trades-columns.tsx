import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { TokenAmountCell, TimestampCell, AddressCell } from '@ui-kit/features/activity-table'
import { t } from '@ui-kit/lib/i18n'
import type { TradeRow } from '../hooks/useLlammaActivity'
import { TradesColumnId } from './columns.enum'

const columnHelper = createColumnHelper<TradeRow>()

export const createTradesColumns = (): ColumnDef<TradeRow, unknown>[] => [
  columnHelper.accessor('amountBought', {
    id: TradesColumnId.Bought,
    header: t`Bought`,
    cell: ({ row }) => (
      <TokenAmountCell
        amount={row.original.amountBought}
        symbol={row.original.tokenBought.symbol}
        tokenAddress={row.original.tokenBought.address}
        chainId={row.original.network}
      />
    ),
  }) as ColumnDef<TradeRow, unknown>,
  columnHelper.accessor('amountSold', {
    id: TradesColumnId.Sold,
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
  }) as ColumnDef<TradeRow, unknown>,
  columnHelper.accessor('buyer', {
    id: TradesColumnId.User,
    header: t`User`,
    cell: ({ getValue }) => <AddressCell address={getValue()} />,
    meta: { type: 'numeric' },
  }) as ColumnDef<TradeRow, unknown>,
  columnHelper.accessor('timestamp', {
    id: TradesColumnId.Time,
    header: t`Time`,
    cell: ({ row }) => <TimestampCell timestamp={row.original.timestamp} txUrl={row.original.url} />,
    meta: { type: 'numeric' },
  }) as ColumnDef<TradeRow, unknown>,
]
