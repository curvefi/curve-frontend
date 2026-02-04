import { ClaimableReward } from '@/llamalend/queries/supply/supply-claimable-rewards.query'
import Typography from '@mui/material/Typography'
import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { type TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { formatUsd } from '@ui-kit/utils'
import { ClaimTokenCell } from '../cells/ClaimTokenCell'
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

const formatNotional = (notional: number | undefined) => (notional == null ? '-' : formatUsd(notional))

export const getClaimTabColumns = (blockchainId: string) => [
  columnHelper.accessor('amount', {
    id: ClaimTabColumnId.Token,
    header: headers[ClaimTabColumnId.Token],
    cell: ({ row }) => (
      <ClaimTokenCell
        blockchainId={blockchainId}
        token={row.original.token}
        symbol={row.original.symbol}
        amount={row.original.amount}
      />
    ),
    enableSorting: false,
  }),
  columnHelper.accessor('notional', {
    id: ClaimTabColumnId.Notional,
    header: headers[ClaimTabColumnId.Notional],
    cell: ({ row }) => (
      <InlineTableCell>
        <Typography variant="tableCellMBold">{formatNotional(row.original.notional)}</Typography>
      </InlineTableCell>
    ),
    meta: { type: 'numeric' },
    enableSorting: false,
  }),
]
