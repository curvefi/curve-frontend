import type { PegKeeper } from '@/loan/components/PagePegKeepers/types'
import { createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { ColumnDefinition, TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { PegKeeperCell } from '../cells'
import { PegKeeperColumnId } from './columns.enum'

export type PegKeeperTableRow = TableItem & {
  pegkeeper: PegKeeper
}

const columnHelper = createColumnHelper<PegKeeperTableRow>()

export const PEG_KEEPER_COLUMNS = [
  columnHelper.accessor(PegKeeperColumnId.PegKeeper, {
    header: t`PegKeeper`,
    cell: PegKeeperCell,
    enableSorting: false,
  }),
] satisfies ColumnDefinition<PegKeeperTableRow>[]
