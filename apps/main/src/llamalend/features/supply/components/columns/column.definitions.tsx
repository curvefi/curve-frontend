import { ClaimableReward } from '@/llamalend/queries/supply/supply-claimable-rewards.query'
import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { type TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { NotionalCell } from '@ui-kit/shared/ui/DataTable/inline-cells/notional-cells'
import { TokenBalanceCell } from '@ui-kit/shared/ui/DataTable/inline-cells/TokenBalanceCell'
import { ClaimTabColumnId } from './columns.enum'

export type ClaimableToken = TableItem &
  ClaimableReward & {
    notional?: number
  }

const columnHelper = createColumnHelper<ClaimableToken>()

const headers = {
  [ClaimTabColumnId.Token]: t`Token`,
  [ClaimTabColumnId.Notional]: t`Notional`,
} as const

export const CLAIM_TAB_COLUMNS = [
  columnHelper.accessor('amount', {
    id: ClaimTabColumnId.Token,
    header: headers[ClaimTabColumnId.Token],
    cell: ({ row, table }) => (
      <TokenBalanceCell
        blockchainId={table.options.meta?.chainId}
        token={row.original.token}
        symbol={row.original.symbol}
        balance={row.original.amount}
      />
    ),
    enableSorting: false,
  }),
  columnHelper.accessor('notional', {
    id: ClaimTabColumnId.Notional,
    header: headers[ClaimTabColumnId.Notional],
    cell: ({ row, table }) => (
      <NotionalCell notional={row.original.notional} isLoading={!!table.options.meta?.isLoading} />
    ),
    meta: { type: 'numeric' },
    enableSorting: false,
  }),
]
