import { useMemo } from 'react'
import { maybes } from '@primitives/objects.utils'
import type { TableItem, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'

export const useFacetedMaxMinValue = <TData extends TableItem>({
  table,
  columnId,
}: {
  /** TanStack table used as the source of faceted min/max values. */
  table: TanstackTable<TData>
  /** Column id to read faceted min/max values from. */
  columnId: string
}) => {
  const [min, max] = table.getColumn(columnId)?.getFacetedMinMaxValues() ?? []

  return { min, max, step: useMemo(() => maybes([max, min], ([max, min]) => (max - min) / 100), [min, max]) }
}
