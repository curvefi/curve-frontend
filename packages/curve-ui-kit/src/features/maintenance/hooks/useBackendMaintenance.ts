import { formatDate, formatTime } from '@ui/utils/utilsDate'
import { useDismissBackendMaintenanceBanner, useDismissBackendMaintenanceModal } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { TIME_FRAMES } from '@ui-kit/lib/model/time'

type BackendMaintenanceConfig = {
  // UTC ISO string date of the scheduled backend maintenance.
  dateISO: string
  // How long before the maintenance we start warning users.
  warnBefore: 'month' | 'week'
  // Optional information to display in the modal and banner.
  expectedDurationLabel?: string
}[]

/** Planned backend maintenance dates sorted chronologically. Maintenance with past dates are ignored. */
export const BACKEND_MAINTENANCES: BackendMaintenanceConfig = [
  {
    dateISO: '2026-05-25T07:00:00.000Z', // 25 May 2026, 09h00 CEST
    warnBefore: 'week',
    expectedDurationLabel: t`20 minutes to 1 hour`,
  },
]
BACKEND_MAINTENANCES.sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())

/** Returns the date when maintenance warnings should start for a scheduled event. */
const getWarningStartsAt = (dateISO: string | undefined, warnBefore: 'month' | 'week' | undefined) => {
  if (!dateISO || !warnBefore) return
  const warningStartsAt = new Date(dateISO)

  if (warnBefore === 'month') {
    warningStartsAt.setUTCMonth(warningStartsAt.getUTCMonth() - 1)
    return warningStartsAt
  }

  warningStartsAt.setUTCDate(warningStartsAt.getUTCDate() - 7)
  return warningStartsAt
}
/**
 * Uses the next scheduled maintenance date to drive warnings.
 * The modal appears first when the warning window starts, then the banner can reappear daily 24h after the modal was dismissed.
 */
export const useBackendMaintenance = () => {
  const nextMaintenance = BACKEND_MAINTENANCES.find(m => new Date(m.dateISO).getTime() > Date.now())
  const { dateISO, warnBefore, expectedDurationLabel } = nextMaintenance ?? {}
  const [modalDismissedAt, setModalDismissedAt] = useDismissBackendMaintenanceModal(dateISO)
  const [shouldShowBanner, dismissBanner] = useDismissBackendMaintenanceBanner(dateISO)

  const warningStartsAt = getWarningStartsAt(dateISO, warnBefore)
  const isWithinWarningWindow =
    !!warningStartsAt &&
    warningStartsAt.getTime() <= Date.now() &&
    !!dateISO &&
    new Date(dateISO).getTime() > Date.now()
  const isModalDismissedYesterday =
    !!modalDismissedAt && new Date(modalDismissedAt).getTime() + TIME_FRAMES.DAY_MS <= Date.now()

  return {
    formattedDate: dateISO && formatDate(new Date(dateISO)),
    formattedTime: dateISO && formatTime(new Date(dateISO), { second: undefined, hour12: true, timeZoneName: 'short' }),
    expectedDurationLabel,
    // We display the banner 24 hours after the the modal has been closed with a daily frequency
    showBanner: shouldShowBanner && isWithinWarningWindow && isModalDismissedYesterday,
    // We display the modal once, during the warning window and only before the scheduled maintenance time.
    showModal: !modalDismissedAt && isWithinWarningWindow,
    dismissModal: () => setModalDismissedAt(new Date().toISOString()),
    dismissBanner,
  }
}
