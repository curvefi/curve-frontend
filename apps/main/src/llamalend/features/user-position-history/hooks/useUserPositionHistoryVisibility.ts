import { useMemo } from 'react'
import { fromEntries, recordValues } from '@curvefi/prices-api/objects.util'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { UserPositionHistoryColumnId } from '../columns'

/**
 * Create a map of column visibility for the User Position History table on mobile devices.
 * On mobile that shows only the event type and time columns.
 */
export const createUserPositionHistoryMobileColumns = () =>
  fromEntries(
    recordValues(UserPositionHistoryColumnId).map((key) => [
      key,
      key === UserPositionHistoryColumnId.Type || key === UserPositionHistoryColumnId.Time,
    ]),
  )

/**
 * Hook to manage the visibility of columns in the User Position History table.
 * On mobile, only shows Type and Time columns.
 * On desktop, shows all columns.
 */
export const useUserPositionHistoryVisibility = () => {
  const isMobile = useIsMobile()
  const columnVisibility = useMemo(() => (isMobile ? createUserPositionHistoryMobileColumns() : undefined), [isMobile])

  return { columnVisibility }
}
