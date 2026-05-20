import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { ColumnDefinition } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import type { MintMarketRow } from '../../../types'
import { NumberCell, PercentCell, TextCell, UsdCell } from '../cells'
import { MintMarketColumnId } from './columns.enum'

const columnHelper = createColumnHelper<MintMarketRow>()

export const MINT_MARKET_COLUMNS = [
  columnHelper.accessor(MintMarketColumnId.Market, {
    header: t`Market`,
    cell: TextCell,
  }),
  columnHelper.accessor(MintMarketColumnId.BorrowApy, {
    header: t`Borrow APY`,
    cell: PercentCell,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor(MintMarketColumnId.BorrowedUsd, {
    header: t`Debt`,
    cell: UsdCell,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor(MintMarketColumnId.CollateralUsd, {
    header: t`Collateral`,
    cell: UsdCell,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor(MintMarketColumnId.Loans, {
    header: t`Loans`,
    cell: NumberCell,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor(MintMarketColumnId.Utilization, {
    header: t`Utilization`,
    cell: PercentCell,
    meta: { type: 'numeric' },
  }),
] satisfies ColumnDefinition<MintMarketRow>[]
