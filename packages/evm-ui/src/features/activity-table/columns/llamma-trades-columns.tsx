import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { scanAddressPath, scanTxPath } from '@legacy-ui/utils'
import { t } from '@ui/lib/i18n'
import { TimestampCell, AddressCell, LlammaTokenAmount } from '../cells'
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
    cell: ({ row }) => (
      <AddressCell
        address={row.original.buyer}
        explorerUrl={scanAddressPath(row.original.chainId, row.original.buyer)}
      />
    ),
  }),
  columnHelper.accessor('amountBought', {
    id: LlammaTradesColumnId.Bought,
    header: t`Buy`,
    cell: ({ row }) => (
      <InlineTableCell sx={{ alignItems: 'end' }}>
        <LlammaTokenAmount
          amount={row.original.amountBought}
          blockchainId={row.original.blockchainId}
          token={row.original.tokenBought}
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
        <LlammaTokenAmount
          amount={-row.original.amountSold}
          blockchainId={row.original.blockchainId}
          token={row.original.tokenSold}
        />
      </InlineTableCell>
    ),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('timestamp', {
    id: LlammaTradesColumnId.Time,
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
