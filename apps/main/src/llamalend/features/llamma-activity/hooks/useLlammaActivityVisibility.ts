import { useMemo } from 'react'
import type { VisibilityState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { TradesColumnId, EventsColumnId } from '../columns/columns.enum'

/**
 * Create mobile column visibility for trades table.
 * On mobile, shows only Bought and Time columns.
 */
const createTradesMobileVisibility = (): VisibilityState => ({
  [TradesColumnId.Bought]: true,
  [TradesColumnId.Sold]: false,
  [TradesColumnId.User]: false,
  [TradesColumnId.Time]: true,
})

/**
 * Create mobile column visibility for events table.
 * On mobile, shows only Action and Time columns.
 */
const createEventsMobileVisibility = (): VisibilityState => ({
  [EventsColumnId.Action]: true,
  [EventsColumnId.Change]: false,
  [EventsColumnId.User]: false,
  [EventsColumnId.Time]: true,
})

/**
 * Hook to manage column visibility for the LLAMMA activity tables.
 * On mobile, only shows key columns with the rest available in the expanded row.
 */
export const useLlammaActivityVisibility = () => {
  const isMobile = useIsMobile()

  const tradesColumnVisibility = useMemo(
    () => (isMobile ? createTradesMobileVisibility() : undefined),
    [isMobile],
  )

  const eventsColumnVisibility = useMemo(
    () => (isMobile ? createEventsMobileVisibility() : undefined),
    [isMobile],
  )

  return { tradesColumnVisibility, eventsColumnVisibility }
}
