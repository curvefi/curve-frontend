import { ClaimableReward } from '@/llamalend/queries/supply/supply-claimable-rewards.query'
import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { type TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenInfo } from '@ui-kit/shared/ui/TokenInfo'
import { formatNumber } from '@ui-kit/utils'
import { ClaimTabColumnId } from './columns.enum'
import { NotionalCell } from './notional-cells'

export type ClaimableToken = TableItem &
  ClaimableReward & {
    networkId: string
    notional?: number
    isLoading?: boolean // used for partial loading states e.g. notional rates
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
    cell: ({ getValue, row }) => (
      <InlineTableCell>
        <TokenInfo
          address={row.original.token}
          blockchainId={row.original.networkId}
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
]
