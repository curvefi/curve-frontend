import { useMemo } from 'react'
import type { VisibilityState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { LlammaEventsColumnId } from '../columns/llamma-events-columns'
import { LlammaTradesColumnId } from '../columns/llamma-trades-columns'

const createTradesMobileVisibility = (): VisibilityState => ({
  [LlammaTradesColumnId.Bought]: true,
  [LlammaTradesColumnId.Sold]: false,
  [LlammaTradesColumnId.User]: false,
  [LlammaTradesColumnId.Time]: true,
})

const createEventsMobileVisibility = (): VisibilityState => ({
  [LlammaEventsColumnId.Action]: true,
  [LlammaEventsColumnId.Change]: false,
  [LlammaEventsColumnId.User]: false,
  [LlammaEventsColumnId.Time]: true,
})

/**
 * Hook to manage column visibility for the LLAMMA activity tables.
 * On mobile, only shows key columns with the rest available in the expanded row.
 */
export const useLlammaActivityVisibility = () => {
  const isMobile = useIsMobile()
  const tradesColumnVisibility = useMemo(() => (isMobile ? createTradesMobileVisibility() : undefined), [isMobile])
  const eventsColumnVisibility = useMemo(() => (isMobile ? createEventsMobileVisibility() : undefined), [isMobile])

  return { tradesColumnVisibility, eventsColumnVisibility }
}
