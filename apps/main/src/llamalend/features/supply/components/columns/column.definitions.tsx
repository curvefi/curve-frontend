import { ClaimableReward } from '@/llamalend/queries/supply/supply-claimable-rewards.query'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { type TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { NotionalCell } from '@ui-kit/shared/ui/DataTable/inline-cells/notional-cells'
import { TokenBalanceCell } from '@ui-kit/shared/ui/DataTable/inline-cells/TokenBalanceCell'
import { ClaimTabColumnId } from './columns.enum'
import { Amount } from '@ui-kit/utils'

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
    cell: TokenBalanceCell<ClaimableToken>,
    enableSorting: false,
  }),
  columnHelper.accessor('notional', {
    id: ClaimTabColumnId.Notional,
    header: headers[ClaimTabColumnId.Notional],
    cell: NotionalCell,
    meta: { type: 'numeric' },
    enableSorting: false,
  }),
]
