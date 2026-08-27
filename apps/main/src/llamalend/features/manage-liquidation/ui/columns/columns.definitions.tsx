import { t } from '@evm-ui/lib/i18n'
import { createAppColumnHelper, type CurveTableItem } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import type { Amount, Decimal } from '@primitives/decimal.utils'
import { LabelCell } from '../cells/LabelCell'
import { ValueCell } from '../cells/ValueCell'
import { ClosePositionRowColumnId } from './columns.enum'

export type ClosePositionRow = CurveTableItem & {
  label: string // row description, like "Collateral"
  value: { symbol: string; amount: Decimal; usd?: Amount }[]
  testId?: string // used for testing, added to the ValueCell when present
}

const columnHelper = createAppColumnHelper<ClosePositionRow>()

const headers = {
  [ClosePositionRowColumnId.Description]: t`Description`,
  [ClosePositionRowColumnId.Value]: t`Value`,
} as const

export const CLOSE_POSITION_COLUMNS = columnHelper.columns([
  columnHelper.accessor('label', {
    id: ClosePositionRowColumnId.Description,
    header: headers[ClosePositionRowColumnId.Description],
    cell: LabelCell,
    enableSorting: false,
  }),
  columnHelper.accessor('value', {
    id: ClosePositionRowColumnId.Value,
    header: headers[ClosePositionRowColumnId.Value],
    cell: ValueCell,
    enableSorting: false,
  }),
])
