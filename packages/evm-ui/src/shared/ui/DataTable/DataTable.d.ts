/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/consistent-type-definitions */
import '@tanstack/table-core'
import type { TypographyVariantKey } from '@evm-ui/themes/typography'
import type { Unit } from '@evm-ui/utils/units'
import type { CellData, RowData, RowModel, Table, TableFeatures } from '@tanstack/table-core'
import type { TooltipProps } from '../Tooltip'

/**
 * Extend TanStack's per-table metadata with Curve DataTable properties.
 */
declare module '@tanstack/table-core' {
  interface ColumnMeta<
    in out TFeatures extends TableFeatures,
    in out TData extends RowData,
    TValue extends CellData = CellData,
  > {
    type?: 'numeric' // aligns cell content to the right
    unit?: Unit // used when displaying the filter's serialized value
    hidden?: boolean // todo: get rid of this property; metadata and column visibility can diverge
    variant?: TypographyVariantKey
    tooltip?: Omit<TooltipProps, 'children'>
  }

  interface TableMeta<in out TFeatures extends TableFeatures, in out TData extends RowData> {
    /** Optional per-table override selected by the shared faceted row-model dispatcher. */
    facetedRowModelFactory?: (table: Table<TFeatures, TData>, columnId: string) => () => RowModel<TFeatures, TData>
  }
}
