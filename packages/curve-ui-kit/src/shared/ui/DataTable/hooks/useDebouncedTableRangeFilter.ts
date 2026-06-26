import { isEqual } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDebounced } from '@ui-kit/hooks/useDebounce'
import type { Range } from '@ui-kit/types/util'

type TableRangeFilter = Range<string | number | null>

type UseDebouncedTableRangeFilterProps<T extends TableRangeFilter> = {
  range: T
  setRange: (range: T) => void
  sanitize?: (range: T) => T
}

/**
 * Debounced adapter for API-backed table filters that write to URL/API state.
 * Keep this hook in a stable table owner, outside transient drawers/popovers, so pending edits survive overlay close.
 */
export const useDebouncedTableRangeFilter = <T extends TableRangeFilter>({
  range,
  setRange,
  sanitize,
}: UseDebouncedTableRangeFilterProps<T>) => {
  const sanitizeRange = useCallback((nextRange: T) => sanitize?.(nextRange) ?? nextRange, [sanitize])
  const [draftRange, setDraftRange] = useState(() => sanitizeRange(range))
  const appliedRangeRef = useRef(draftRange)

  useEffect(() => {
    const nextRange = sanitizeRange(range)

    if (!isEqual(nextRange, appliedRangeRef.current)) {
      appliedRangeRef.current = nextRange
      setDraftRange(nextRange)
    }
  }, [range, sanitizeRange])

  const applyRange = useCallback(
    (nextDraftRange: T) => {
      const nextRange = sanitizeRange(nextDraftRange)

      setDraftRange(nextRange)
      if (!isEqual(nextRange, appliedRangeRef.current)) {
        appliedRangeRef.current = nextRange
        setRange(nextRange)
      }
    },
    [sanitizeRange, setRange],
  )
  const [setDebouncedDraftRange, cancelDraftRange] = useDebounced(applyRange, undefined, (nextRange: T) =>
    setDraftRange(nextRange),
  )

  const setAppliedRange = useCallback(
    (nextRange: T) => {
      const sanitizedRange = sanitizeRange(nextRange)

      cancelDraftRange()
      setDraftRange(sanitizedRange)
      if (!isEqual(sanitizedRange, appliedRangeRef.current)) {
        appliedRangeRef.current = sanitizedRange
        setRange(sanitizedRange)
      }
    },
    [cancelDraftRange, sanitizeRange, setRange],
  )
  const resetDraftRange = useCallback(
    (nextRange: T) => {
      const sanitizedRange = sanitizeRange(nextRange)

      cancelDraftRange()
      appliedRangeRef.current = sanitizedRange
      setDraftRange(sanitizedRange)
    },
    [cancelDraftRange, sanitizeRange],
  )

  return useMemo(
    () => ({ draftRange, setDraftRange: setDebouncedDraftRange, setAppliedRange, cancelDraftRange, resetDraftRange }),
    [cancelDraftRange, draftRange, resetDraftRange, setAppliedRange, setDebouncedDraftRange],
  )
}
