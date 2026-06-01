import { useRef } from 'react'
import { useResizeObserver } from '@ui-kit/hooks/useResizeObserver'

/** Determines whether the table header can stay sticky based on the table and wrapper widths. */
export const useTableStickyHeader = (enabled?: boolean) => {
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const [tableWrapperWidth] = useResizeObserver(tableWrapperRef)
  const [tableWidth] = useResizeObserver(tableRef)

  return {
    tableRef,
    tableWrapperRef,
    shouldStickyHeader: enabled && tableWidth != null && tableWrapperWidth != null && tableWidth <= tableWrapperWidth,
  }
}
