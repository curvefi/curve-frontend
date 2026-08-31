import { t } from '@evm-ui/lib/i18n'
import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { TimestampCell, DebtChangeCell, EventTypeCell, CollateralChangeCell } from '../cells'
import type { ParsedUserCollateralEvent } from '../hooks/useUserCollateralEvents'
import { UserPositionHistoryColumnId } from './columns.enum'

const columnHelper = createAppColumnHelper<ParsedUserCollateralEvent>()

const headers = {
  [UserPositionHistoryColumnId.Type]: t`Type`,
  [UserPositionHistoryColumnId.Collateral]: t`Collateral`,
  [UserPositionHistoryColumnId.Debt]: t`Debt`,
  [UserPositionHistoryColumnId.Leverage]: t`Leverage`,
  [UserPositionHistoryColumnId.Time]: t`Time`,
}

export const USER_POSITION_HISTORY_COLUMNS = columnHelper.columns([
  columnHelper.accessor('type', {
    id: UserPositionHistoryColumnId.Type,
    header: headers[UserPositionHistoryColumnId.Type],
    cell: EventTypeCell,
  }),
  columnHelper.accessor('collateralChange', {
    id: UserPositionHistoryColumnId.Collateral,
    header: headers[UserPositionHistoryColumnId.Collateral],
    cell: CollateralChangeCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('loanChange', {
    id: UserPositionHistoryColumnId.Debt,
    header: headers[UserPositionHistoryColumnId.Debt],
    cell: DebtChangeCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('timestamp', {
    id: UserPositionHistoryColumnId.Time,
    header: headers[UserPositionHistoryColumnId.Time],
    cell: ({ row }) => (
      <TimestampCell timestamp={new Date(row.original.timestamp)} txUrl={row.original.url} align="end" />
    ),
    meta: { type: 'numeric' },
  }),
])
