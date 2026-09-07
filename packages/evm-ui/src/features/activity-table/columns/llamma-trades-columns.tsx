import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { formatNumber } from '@evm-ui/utils'
import { scanAddressPath, scanTxPath } from '@legacy-ui/utils'
import { TokenInfo } from '@ui/components/TokenInfo'
import { t } from '@ui/lib/i18n'
import { TimestampCell, AddressCell } from '../cells'
import type { MarketTradeRow } from '../types'

const LlammaTradeTokenCell = ({
  address,
  amount,
  blockchainId,
}: {
  address: MarketTradeRow['tokenBought']['address']
  amount: number
  blockchainId: MarketTradeRow['blockchainId']
}) => (
  <InlineTableCell sx={{ alignItems: 'end' }}>
    <TokenInfo
      address={address}
      blockchainId={blockchainId}
      iconPosition="right"
      iconSize="mui-md"
      primary={formatNumber(amount, { abbreviate: false })}
    />
  </InlineTableCell>
)

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
      <LlammaTradeTokenCell
        address={row.original.tokenBought.address}
        amount={row.original.amountBought}
        blockchainId={row.original.blockchainId}
      />
    ),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('amountSold', {
    id: LlammaTradesColumnId.Sold,
    header: t`Sell`,
    cell: ({ row }) => (
      <LlammaTradeTokenCell
        address={row.original.tokenSold.address}
        amount={-row.original.amountSold}
        blockchainId={row.original.blockchainId}
      />
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
