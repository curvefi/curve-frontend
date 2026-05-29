import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo } from '@ui-kit/shared/ui/TokenInfo'
import { formatNumber } from '@ui-kit/utils'
import { TimestampCell, AddressCell } from '../cells'
import type { PoolTradeRow } from '../types'

export enum PoolTradesColumnId {
  Bought = 'tokensBought',
  Sold = 'tokensSold',
  User = 'buyer',
  Time = 'time',
}

const columnHelper = createColumnHelper<PoolTradeRow>()

export const POOL_TRADES_COLUMNS = [
  columnHelper.accessor('buyer', {
    id: PoolTradesColumnId.User,
    header: t`Address`,
    cell: ({ getValue }) => <AddressCell address={getValue()} />,
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
          secondary={formatNumber(row.original.tokensBoughtUsd, { unit: 'dollar', abbreviate: true })}
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
          secondary={formatNumber(-row.original.tokensSoldUsd, { unit: 'dollar', abbreviate: true })}
        />
      </InlineTableCell>
    ),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('time', {
    id: PoolTradesColumnId.Time,
    header: t`Time`,
    cell: ({ row }) => <TimestampCell timestamp={new Date(row.original.time)} txUrl={row.original.txUrl} align="end" />,
  }),
]
