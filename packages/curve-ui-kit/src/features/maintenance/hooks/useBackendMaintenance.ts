import { useMemo } from 'react'
import { formatDate, formatTime } from '@ui/utils/utilsDate'
import { useDismissBackendMaintenanceBanner, useDismissBackendMaintenanceModal } from '@ui-kit/hooks/useLocalStorage'
import { TIME_FRAMES } from '@ui-kit/lib/model/time'

export type BackendMaintenanceConfig = {
  // UTC ISO string date of the scheduled backend maintenance.
  dateISO: string
  // How long before the maintenance we start warning users.
  warnBefore: 'month' | 'week'
  // Optional information to display in the modal and banner.
  expectedDurationLabel?: string
}[]

export type BackendMaintenance = {
  formattedDate: string | undefined
  formattedTime: string | undefined
  expectedDurationLabel?: string
  showBanner: boolean
  showModal: boolean
  dismissModal: () => void
  dismissBanner: () => void
}

/** Returns the date when maintenance warnings should start for a scheduled event. */
const getWarningStartsAt = (dateISO: string | undefined, warnBefore: 'month' | 'week' | undefined) => {
  if (!dateISO || !warnBefore) return
  const warningStartsAt = new Date(dateISO)

  if (warnBefore === 'month') {
    // a month before
    warningStartsAt.setUTCMonth(warningStartsAt.getUTCMonth() - 1)
    return warningStartsAt
  }

  // a week before
  warningStartsAt.setUTCDate(warningStartsAt.getUTCDate() - 7)
  return warningStartsAt
}

/**
 * Uses the next scheduled maintenance date to drive warnings.
 * The modal appears first when the warning window starts, then the banner can reappear daily 24h after the modal was dismissed.
 */
export const useBackendMaintenance = ({
  maintenances,
}: {
  maintenances: BackendMaintenanceConfig
}): BackendMaintenance => {
  const nextMaintenance = useMemo(
    () =>
      maintenances
        .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())
        .find(m => new Date(m.dateISO).getTime() > Date.now()),
    [maintenances],
  )
  const { dateISO, warnBefore, expectedDurationLabel } = nextMaintenance ?? {}
  const [modalDismissedAt, setModalDismissedAt] = useDismissBackendMaintenanceModal(dateISO)
  const [shouldShowBanner, dismissBanner] = useDismissBackendMaintenanceBanner(dateISO)

  const warningStartsAt = getWarningStartsAt(dateISO, warnBefore)
  const isWithinWarningWindow =
    !!warningStartsAt &&
    warningStartsAt.getTime() <= Date.now() &&
    !!dateISO &&
    new Date(dateISO).getTime() > Date.now()
  const isModalDismissedAtLeastADayAgo =
    !!modalDismissedAt && new Date(modalDismissedAt).getTime() + TIME_FRAMES.DAY_MS <= Date.now()

  return {
    formattedDate: dateISO && formatDate(new Date(dateISO)),
    formattedTime: dateISO && formatTime(new Date(dateISO), { second: undefined, hour12: true, timeZoneName: 'short' }),
    expectedDurationLabel,
    // We display the banner 24 hours after the the modal has been closed with a daily frequency
    showBanner: shouldShowBanner && isWithinWarningWindow && isModalDismissedAtLeastADayAgo,
    // We display the modal once, during the warning window and only before the scheduled maintenance time.
    showModal: !modalDismissedAt && isWithinWarningWindow,
    dismissModal: () => setModalDismissedAt(new Date().toISOString()),
    dismissBanner,
  }
}
