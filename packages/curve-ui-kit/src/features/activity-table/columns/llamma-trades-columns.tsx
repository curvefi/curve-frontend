import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo } from '@ui-kit/shared/ui/TokenInfo'
import { formatNumber } from '@ui-kit/utils'
import { TimestampCell, AddressCell } from '../cells'
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
    cell: ({ getValue, row }) => <AddressCell address={getValue()} explorerUrl={row.original.buyerUrl} />,
  }),
  columnHelper.accessor('amountBought', {
    id: LlammaTradesColumnId.Bought,
    header: t`Buy`,
    cell: ({ row }) => (
      <InlineTableCell sx={{ alignItems: 'end' }}>
        <TokenInfo
          address={row.original.tokenBought.address}
          blockchainId={row.original.network}
          iconPosition="right"
          primary={formatNumber(row.original.amountBought, { abbreviate: false })}
        />
      </InlineTableCell>
    ),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('amountSold', {
    id: LlammaTradesColumnId.Sold,
    header: t`Sell`,
    cell: ({ row }) => (
      <InlineTableCell sx={{ alignItems: 'end' }}>
        <TokenInfo
          address={row.original.tokenSold.address}
          blockchainId={row.original.network}
          iconPosition="right"
          primary={formatNumber(-row.original.amountSold, { abbreviate: false })}
        />
      </InlineTableCell>
    ),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('timestamp', {
    id: LlammaTradesColumnId.Time,
    header: t`Time`,
    cell: ({ row }) => (
      <TimestampCell timestamp={new Date(row.original.timestamp)} txUrl={row.original.txUrl} align="end" />
    ),
    meta: { type: 'numeric' },
  }),
]
