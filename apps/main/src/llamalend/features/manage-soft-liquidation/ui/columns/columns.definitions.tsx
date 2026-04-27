import type { Amount } from '@primitives/decimal.utils'
import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import type { TokenAmount } from '../action-infos/types'
import { LabelCell } from '../cells/LabelCell'
import { ValueCell } from '../cells/ValueCell'
import { ClosePositionRowColumnId } from './columns.enum'

type ClosePositionToken = TokenAmount & { usd?: Amount }

export type ClosePositionRow = TableItem & {
  label: string // row description, like "Collateral"
  value: ClosePositionToken[]
  testId?: string // used for testing, added to the ValueCell when present
}

const columnHelper = createColumnHelper<ClosePositionRow>()

const headers = {
  [ClosePositionRowColumnId.Description]: t`Description`,
  [ClosePositionRowColumnId.Value]: t`Value`,
} as const

export const CLOSE_POSITION_COLUMNS = [
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
]
