import { useMemo } from 'react'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { maybes } from '@primitives/objects.utils'
import type { ReactTable, RowData } from '@tanstack/react-table'

/** Returns min, max, and step from a TanStack column's faceted min/max values. */
export const useFacetedMaxMinValue = <TData extends RowData>({
  table,
  columnId,
}: {
  /** TanStack table used as the source of faceted min/max values. */
  table: ReactTable<CurveTableFeatures, TData>
  /** Column id to read faceted min/max values from. */
  columnId: string
}) => {
  const [min, max] = table.getColumn(columnId)?.getFacetedMinMaxValues() ?? []

  return {
    min,
    max,
    step: useMemo(() => maybes([max, min], (max, min) => Math.max((max - min) / 100, 0)), [min, max]),
  }
}
