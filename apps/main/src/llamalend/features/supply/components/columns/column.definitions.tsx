import { ClaimableReward } from '@/llamalend/queries/supply/supply-claimable-rewards.query'
import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { formatNumber } from '@evm-ui/utils'
import { TokenInfo } from '@ui/components/TokenInfo'
import { t } from '@ui/lib/i18n'
import { ClaimTabColumnId } from './columns.enum'
import { NotionalCell } from './notional-cells'

export type ClaimableToken = ClaimableReward & {
  blockchainId: string
  notional?: number
  isLoading?: boolean // used for partial loading states e.g. notional rates
}

const columnHelper = createAppColumnHelper<ClaimableToken>()

const headers = {
  [ClaimTabColumnId.Token]: t`Token`,
  [ClaimTabColumnId.Notional]: t`Notional`,
} as const

export const CLAIM_TAB_COLUMNS = columnHelper.columns([
  columnHelper.accessor('amount', {
    id: ClaimTabColumnId.Token,
    header: headers[ClaimTabColumnId.Token],
    cell: ({ getValue, row }) => (
      <InlineTableCell>
        <TokenInfo
          address={row.original.token}
          blockchainId={row.original.blockchainId}
          iconPosition="left"
          primary={formatNumber(getValue(), { abbreviate: false })}
          secondary={row.original.symbol}
          showChainIcon
          boldPrimary
        />
      </InlineTableCell>
    ),
    enableSorting: false,
  }),
  columnHelper.accessor('notional', {
    id: ClaimTabColumnId.Notional,
    header: headers[ClaimTabColumnId.Notional],
    cell: NotionalCell<ClaimableToken>,
    meta: { type: 'numeric' },
    enableSorting: false,
  }),
])
