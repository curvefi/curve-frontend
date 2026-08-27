import { type RefObject, useEffect, useEffectEvent, useRef } from 'react'
import type { ReactTable } from '@tanstack/react-table'
import type { CurveTableFeatures, CurveTableItem } from '../data-table.utils'

type UseTableScrollOptions<T extends CurveTableItem> = {
  table: ReactTable<CurveTableFeatures, T>
  tableTopRef?: RefObject<HTMLElement | null>
  containerRef?: RefObject<HTMLElement | null>
}

const scrollTableTopIntoView = (tableTopRef: RefObject<HTMLElement | null>) => {
  tableTopRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}

/** Runs an effect only after the tracked value changes, skipping the initial render. */
const useEffectOnValueChange = <T>(value: T, effect: () => void) => {
  const previousValueRef = useRef(value)
  const effectEvent = useEffectEvent(effect)

  useEffect(() => {
    const previousValue = previousValueRef.current
    previousValueRef.current = value

    if (previousValue !== value) effectEvent()
  }, [value])
}

/** Scrolls to the top of the table whenever the column filters change. */
export function useScrollToTopOnFilterChange<T extends CurveTableItem>({
  table,
  tableTopRef,
}: UseTableScrollOptions<T>) {
  const { columnFilters } = table.state
  const columnFiltersKey = JSON.stringify(columnFilters)

  useEffectOnValueChange(columnFiltersKey, () => {
    if (tableTopRef) scrollTableTopIntoView(tableTopRef)
  })
}

/** Scrolls to the top of the table whenever the page changes. */
export function useScrollToTopOnPageChange<T extends CurveTableItem>({
  table,
  tableTopRef,
  containerRef,
}: UseTableScrollOptions<T>) {
  const { pageIndex } = table.state.pagination
  useEffectOnValueChange(pageIndex, () => {
    // scroll after the user changes pages
    if (containerRef?.current) containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    else if (tableTopRef) scrollTableTopIntoView(tableTopRef)
  })
}
