import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { ColumnDefinition } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import type { YieldBasisPoolRow } from '../../../types'
import { NumberCell, PercentCell, TextCell, UsdCell } from '../cells'
import { YieldBasisPoolColumnId } from './columns.enum'

const columnHelper = createColumnHelper<YieldBasisPoolRow>()

export const YIELD_BASIS_POOL_COLUMNS = [
  columnHelper.accessor(YieldBasisPoolColumnId.Name, {
    header: t`Pool`,
    cell: TextCell,
  }),
  columnHelper.accessor(YieldBasisPoolColumnId.Volume7d, {
    header: t`YB Volume 7d`,
    cell: UsdCell,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor(YieldBasisPoolColumnId.AdjacentVolume7d, {
    header: t`Adjacent Volume 7d`,
    cell: UsdCell,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor(YieldBasisPoolColumnId.TotalVolume7d, {
    header: t`Total Volume 7d`,
    cell: UsdCell,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor(YieldBasisPoolColumnId.AdjacentVolumeShare, {
    header: t`Adjacent Share`,
    cell: PercentCell,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor(YieldBasisPoolColumnId.TransactionCount, {
    header: t`Txs`,
    cell: NumberCell,
    meta: { type: 'numeric' },
  }),
] satisfies ColumnDefinition<YieldBasisPoolRow>[]
