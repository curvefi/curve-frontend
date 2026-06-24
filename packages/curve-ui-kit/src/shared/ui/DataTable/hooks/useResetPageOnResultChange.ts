import { useEffect, useEffectEvent, useRef } from 'react'
import { TableItem, TanstackTable } from '../data-table.utils'
/**
 * Resets the table pagination to the first page whenever the number of filtered results changes.
 * Skipped for manual pagination since data changes on every page change.
 */
export function useResetPageOnResultChange<T extends TableItem>(table: TanstackTable<T>) {
  const isManualPagination = table.options.manualPagination
  const resultCount = table.getFilteredRowModel().rows.length
  const onPaginationChangeEvent = useEffectEvent(table.setPagination)
  const lastResultCountRef = useRef<number>(resultCount)
  useEffect(() => {
    // Skip for manual pagination - data is expected to change on page change
    if (isManualPagination) return
    // Reset to first page, but only if result amount wasn't 0 (links must keep working while data might still be loading)
    if (lastResultCountRef.current && resultCount) onPaginationChangeEvent(prev => ({ ...prev, pageIndex: 0 }))
    lastResultCountRef.current = resultCount
  }, [resultCount, isManualPagination])
}
