import { useMemo } from 'react'
import { notFalsyArray } from '@primitives/objects.utils'
import type { TableItem, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'

/** Returns sorted string options from a TanStack column's faceted unique values. */
export const useFacetedSortedOptions = <TData extends TableItem>(table: TanstackTable<TData>, columnId: string) => {
  const facetedUniqueValues = table.getColumn(columnId)?.getFacetedUniqueValues()

  return useMemo(
    () => notFalsyArray<string>(Array.from(facetedUniqueValues?.keys() ?? [])).sort(),
    [facetedUniqueValues],
  )
}
