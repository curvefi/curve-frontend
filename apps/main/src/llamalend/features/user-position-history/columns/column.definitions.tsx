import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { TimestampCell, DebtChangeCell, EventTypeCell, CollateralChangeCell } from '../cells'
import type { ParsedUserCollateralEvent } from '../hooks/useUserCollateralEvents'
import { UserPositionHistoryColumnId } from './columns.enum'

const columnHelper = createColumnHelper<ParsedUserCollateralEvent>()

const headers = {
  [UserPositionHistoryColumnId.Type]: t`Type`,
  [UserPositionHistoryColumnId.Collateral]: t`Collateral`,
  [UserPositionHistoryColumnId.Debt]: t`Debt`,
  [UserPositionHistoryColumnId.Leverage]: t`Leverage`,
  [UserPositionHistoryColumnId.Time]: t`Time`,
}

export const USER_POSITION_HISTORY_COLUMNS = [
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
    cell: ({ row }) => <TimestampCell timestamp={row.original.timestamp} txUrl={row.original.txUrl} />,
    meta: { type: 'numeric' },
  }),
]
