import { t } from '@evm-ui/lib/i18n'
import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo } from '@evm-ui/shared/ui/TokenInfo'
import { formatNumber } from '@evm-ui/utils'
import { TimestampCell, AddressCell } from '../cells'
import type { PoolTradeRow } from '../types'

export enum PoolTradesColumnId {
  Bought = 'tokensBought',
  Sold = 'tokensSold',
  User = 'buyer',
  Time = 'time',
}

const columnHelper = createAppColumnHelper<PoolTradeRow>()

export const POOL_TRADES_COLUMNS = columnHelper.columns([
  columnHelper.accessor('buyer', {
    id: PoolTradesColumnId.User,
    header: t`Address`,
    cell: ({ row }) => <AddressCell address={row.original.buyer} explorerUrl={row.original.buyerUrl} />,
  }),
  columnHelper.accessor('tokensBought', {
    id: PoolTradesColumnId.Bought,
    header: t`Buy`,
    cell: ({ row }) => (
      <InlineTableCell sx={{ alignItems: 'end' }}>
        <TokenInfo
          address={row.original.tokenBought.address}
          blockchainId={row.original.network}
          iconPosition="right"
          primary={formatNumber(row.original.tokensBought, { abbreviate: false })}
          secondary={formatNumber(row.original.tokensBoughtUsd, 'usd.notional')}
        />
      </InlineTableCell>
    ),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('tokensSold', {
    id: PoolTradesColumnId.Sold,
    header: t`Sell`,
    cell: ({ row }) => (
      <InlineTableCell sx={{ alignItems: 'end' }}>
        <TokenInfo
          address={row.original.tokenSold.address}
          blockchainId={row.original.network}
          iconPosition="right"
          primary={formatNumber(-row.original.tokensSold, { abbreviate: false })}
          secondary={formatNumber(-row.original.tokensSoldUsd, 'usd.notional')}
        />
      </InlineTableCell>
    ),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('time', {
    id: PoolTradesColumnId.Time,
    header: t`Time`,
    cell: ({ row }) => <TimestampCell timestamp={new Date(row.original.time)} txUrl={row.original.txUrl} align="end" />,
    meta: { type: 'numeric' },
  }),
])
