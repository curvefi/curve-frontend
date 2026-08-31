import { t } from '@evm-ui/lib/i18n'
import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo } from '@evm-ui/shared/ui/TokenInfo'
import { formatNumber } from '@evm-ui/utils'
import { TimestampCell, AddressCell } from '../cells'
import type { MarketTradeRow } from '../types'

export enum LlammaTradesColumnId {
  User = 'buyer',
  Bought = 'amountBought',
  Sold = 'amountSold',
  Time = 'timestamp',
}

const columnHelper = createAppColumnHelper<MarketTradeRow>()

export const LLAMMA_TRADES_COLUMNS = columnHelper.columns([
  columnHelper.accessor('buyer', {
    id: LlammaTradesColumnId.User,
    header: t`Address`,
    cell: ({ row }) => <AddressCell address={row.original.buyer} explorerUrl={row.original.buyerUrl} />,
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
])
