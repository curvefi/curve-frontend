import { formatDate, formatTime } from '@ui/utils/utilsDate'
import { useDismissMaintenanceBanner, useDismissMaintenanceModal } from '@ui-kit/hooks/useLocalStorage'
import { TIME_FRAMES } from '@ui-kit/lib/model/time'

export type MaintenanceConfig = {
  // UTC ISO string date of the scheduled maintenance.
  dateISO: string
  // How long before the maintenance we start warning users.
  warnBefore: 'month' | 'week'
  // Optional information to display in the modal and banner.
  expectedDurationLabel?: string
  learnMoreLink?: string
} | null

export type Maintenance = {
  formattedDate: string | undefined
  formattedTime: string | undefined
  expectedDurationLabel?: string
  showBanner: boolean
  showModal: boolean
  dismissModal: () => void
  dismissBanner: () => void
  learnMoreLink?: string
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
export const useMaintenance = (maintenance: MaintenanceConfig): Maintenance => {
  const { dateISO, warnBefore, expectedDurationLabel, learnMoreLink } = maintenance ?? {}
  const [modalDismissedAt, setModalDismissedAt] = useDismissMaintenanceModal(dateISO)
  const [shouldShowBanner, dismissBanner] = useDismissMaintenanceBanner(dateISO)

  const warningStartsAt = getWarningStartsAt(dateISO, warnBefore)
  const maintenanceDate = dateISO && new Date(dateISO)
  const isWithinWarningWindow =
    !!warningStartsAt &&
    warningStartsAt.getTime() <= Date.now() &&
    !!maintenanceDate &&
    maintenanceDate.getTime() > Date.now()
  const isModalDismissedAtLeastADayAgo =
    !!modalDismissedAt && new Date(modalDismissedAt).getTime() + TIME_FRAMES.DAY_MS <= Date.now()

  return {
    formattedDate: maintenanceDate && formatDate(maintenanceDate),
    formattedTime: maintenanceDate && formatTime(maintenanceDate, { precise: false, timeZoneName: 'short' }),
    expectedDurationLabel,
    // We display the banner 24 hours after the the modal has been closed with a daily frequency
    showBanner: shouldShowBanner && isWithinWarningWindow && isModalDismissedAtLeastADayAgo,
    // We display the modal once, during the warning window and only before the scheduled maintenance time.
    showModal: !modalDismissedAt && isWithinWarningWindow,
    dismissModal: () => setModalDismissedAt(new Date().toISOString()),
    dismissBanner,
    learnMoreLink,
  }
}
