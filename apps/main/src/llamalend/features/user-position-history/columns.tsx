import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { CollateralChangeCell } from './cells/CollateralChangeCell'
import { DebtChangeCell } from './cells/DebtChangeCell'
import { EventTypeCell } from './cells/EventTypeCell'
import { TimestampCell } from './cells/TimestampCell'
import { UserPositionHistoryColumnId } from './columns.enum'
import type { ParsedUserLendCollateralEvent } from './hooks/useUserLendCollateralEvents'

const columnHelper = createColumnHelper<ParsedUserLendCollateralEvent>()

const headers = {
  [UserPositionHistoryColumnId.Type]: t`Type`,
  [UserPositionHistoryColumnId.Collateral]: t`Collateral`,
  [UserPositionHistoryColumnId.Debt]: t`Debt`,
  [UserPositionHistoryColumnId.Leverage]: t`Leverage`,
  [UserPositionHistoryColumnId.Time]: t`Time`,
}

export const USER_POSITION_HISTORY_COLUMNS = [
  columnHelper.accessor(UserPositionHistoryColumnId.Type, {
    header: headers[UserPositionHistoryColumnId.Type],
    cell: EventTypeCell,
  }),
  columnHelper.accessor(UserPositionHistoryColumnId.Collateral, {
    header: headers[UserPositionHistoryColumnId.Collateral],
    cell: CollateralChangeCell,
  }),
  columnHelper.accessor(UserPositionHistoryColumnId.Debt, {
    header: headers[UserPositionHistoryColumnId.Debt],
    cell: DebtChangeCell,
  }),
  columnHelper.accessor(UserPositionHistoryColumnId.Time, {
    header: headers[UserPositionHistoryColumnId.Time],
    cell: TimestampCell,
  }),
]
