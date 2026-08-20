import { useMemo } from 'react'
import { notFalsyArray } from '@primitives/objects.utils'
import type { TableItem, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'

/** Returns sorted string options from a TanStack column's faceted unique values. */
export const useFacetedSortedOptions = <TData extends TableItem>({
  table,
  columnId,
}: {
  /** TanStack table used as the source of faceted unique values. */
  table: TanstackTable<TData>
  /** Column id to read faceted unique values from. */
  columnId: string
}) => {
  const facetedUniqueValues = table.getColumn(columnId)?.getFacetedUniqueValues()

  return useMemo(
    // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
    () => notFalsyArray<string>(Array.from(facetedUniqueValues?.keys() ?? [])).sort(),
    [facetedUniqueValues],
  )
}
