import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { ColumnDefinition, TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { LabelCell, ValueCell } from '../cells'
import { SupplySummaryColumnId } from './columns.enum'

export type SupplySummaryRow = TableItem & {
  label: string
  value: number | undefined
  total?: number
  percentage?: number
  showSign?: boolean
  loading: boolean
}

const columnHelper = createColumnHelper<SupplySummaryRow>()

export const SUPPLY_SUMMARY_COLUMNS = [
  columnHelper.accessor(SupplySummaryColumnId.Label, {
    header: t`Label`,
    cell: LabelCell,
    enableSorting: false,
  }),
  columnHelper.accessor(SupplySummaryColumnId.Value, {
    header: t`Value`,
    cell: ValueCell,
    meta: { type: 'numeric' },
    enableSorting: false,
  }),
] satisfies ColumnDefinition<SupplySummaryRow>[]
