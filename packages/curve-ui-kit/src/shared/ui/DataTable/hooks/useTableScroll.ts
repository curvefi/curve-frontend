import { type RefObject, useEffect, useRef } from 'react'
import type { TableItem, TanstackTable } from '../data-table.utils'

const scrollToTableTop = (tableTopRef: RefObject<HTMLElement | null>) => {
  tableTopRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}

/**
 * Scrolls to the top of the table whenever the column filters change.
 */
export function useScrollToTopOnFilterChange<T extends TableItem>(
  table: TanstackTable<T>,
  tableTopRef: RefObject<HTMLElement | null>,
) {
  const { columnFilters } = table.getState()
  useEffect(() => {
    if (columnFilters.length) {
      scrollToTableTop(tableTopRef)
    }
  }, [columnFilters, tableTopRef])
}

/**
 * Scrolls to the top of the table whenever the page changes.
 */
export function useScrollToTopOnPageChange<T extends TableItem>(
  table: TanstackTable<T>,
  tableTopRef: RefObject<HTMLElement | null>,
) {
  const { pageIndex } = table.getState().pagination
  const lastPageIndexRef = useRef(pageIndex)
  useEffect(() => {
    // Avoid scrolling on the initial render, only scroll after the user changes pages.
    if (lastPageIndexRef.current !== pageIndex) {
      scrollToTableTop(tableTopRef)
    }
    lastPageIndexRef.current = pageIndex
  }, [pageIndex, tableTopRef])
}
