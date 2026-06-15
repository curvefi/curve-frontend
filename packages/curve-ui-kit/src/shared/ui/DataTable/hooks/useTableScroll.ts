import { type RefObject, useEffect, useRef } from 'react'
import type { TableItem, TanstackTable } from '../data-table.utils'

type UseTableScrollOptions<T extends TableItem> = {
  table: TanstackTable<T>
  tableTopRef?: RefObject<HTMLElement | null>
  containerRef?: RefObject<HTMLElement | null>
}

const scrollToTableTop = (tableTopRef: RefObject<HTMLElement | null>) => {
  tableTopRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}

/**
 * Scrolls to the top of the table whenever the column filters change.
 */
export function useScrollToTopOnFilterChange<T extends TableItem>({ table, tableTopRef }: UseTableScrollOptions<T>) {
  const { columnFilters } = table.getState()
  const columnFiltersKey = JSON.stringify(columnFilters)
  const previousColumnFiltersKeyRef = useRef(columnFiltersKey)

  useEffect(() => {
    const previousColumnFiltersKey = previousColumnFiltersKeyRef.current
    previousColumnFiltersKeyRef.current = columnFiltersKey

    if (tableTopRef && previousColumnFiltersKey !== columnFiltersKey) scrollToTableTop(tableTopRef)
  }, [columnFiltersKey, tableTopRef])
}

/**
 * Scrolls to the top of the table whenever the page changes.
 */
export function useScrollToTopOnPageChange<T extends TableItem>({
  table,
  tableTopRef,
  containerRef,
}: UseTableScrollOptions<T>) {
  const { pageIndex } = table.getState().pagination
  const previousPageIndexRef = useRef(pageIndex)
  useEffect(() => {
    const previousPageIndex = previousPageIndexRef.current
    previousPageIndexRef.current = pageIndex

    // scroll after the user changes pages
    if (previousPageIndex === pageIndex) return
    else if (containerRef) containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    else if (tableTopRef) scrollToTableTop(tableTopRef)
  }, [containerRef, pageIndex, tableTopRef])
}
