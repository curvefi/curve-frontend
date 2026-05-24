import { useState } from 'react'
import { Falsy } from '@primitives/objects.utils'
import { formatDate, formatTime } from '@ui/utils/utilsDate'
import { useDismissMaintenanceBanner, useDismissMaintenanceModal } from '@ui-kit/hooks/useLocalStorage'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL, TIME_OPTION_MS } from '@ui-kit/lib/model/time'

export type MaintenanceConfig = {
  // UTC ISO string date of the scheduled maintenance.
  dateISO: string
  // How long before the maintenance we start warning users in milliseconds.
  warnBeforeMs: number
  // How long the maintenance mode should stay active after the scheduled start time in milliseconds.
  durationMs: number
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
  // true if the maintenance period has started
  isMaintenanceMode: boolean
}

/** Returns the time when maintenance warnings should start for a scheduled event. */
const getWarningStartsTime = (dateISO: string | undefined, warnBeforeMs: number | undefined) =>
  !dateISO || !warnBeforeMs ? undefined : new Date(dateISO).getTime() - warnBeforeMs

const isWithinInterval = ({
  currentTime,
  startTime,
  duration,
}: {
  currentTime: number
  startTime: number | Falsy
  duration: number | undefined
}) => !!startTime && !!duration && startTime <= currentTime && currentTime <= startTime + duration

/**
 * Uses the next scheduled maintenance date to drive warnings.
 * The modal appears first when the warning window starts, then the banner can reappear daily 24h after the modal was dismissed.
 */
export const useMaintenance = (maintenance: MaintenanceConfig): Maintenance => {
  const { dateISO, warnBeforeMs, durationMs, expectedDurationLabel, learnMoreLink } = maintenance ?? {}
  const [modalDismissedAt, setModalDismissedAt] = useDismissMaintenanceModal(dateISO)
  const [shouldShowBanner, dismissBanner] = useDismissMaintenanceBanner(dateISO)
  const [currentTime, setCurrentTime] = useState(Date.now)

  usePageVisibleInterval(() => setCurrentTime(Date.now()), REFRESH_INTERVAL['1m'])

  const warningStartsTime = getWarningStartsTime(dateISO, warnBeforeMs)
  const maintenanceDate = dateISO && new Date(dateISO)
  const isWithinWarningWindow = isWithinInterval({
    currentTime,
    startTime: warningStartsTime,
    duration: warnBeforeMs,
  })
  const isModalDismissedAtLeastADayAgo =
    !!modalDismissedAt && new Date(modalDismissedAt).getTime() + TIME_OPTION_MS['1d'] <= currentTime

  return {
    formattedDate: maintenanceDate && formatDate(maintenanceDate),
    formattedTime: maintenanceDate && formatTime(maintenanceDate, { precise: false, timeZoneName: 'short' }),
    expectedDurationLabel,
    // We display the banner 24 hours after the the modal has been closed with a daily frequency
    showBanner: shouldShowBanner && isWithinWarningWindow && isModalDismissedAtLeastADayAgo,
    // We display the modal once, during the warning window and only before the scheduled maintenance time.
    showModal: !modalDismissedAt && isWithinWarningWindow,
    isMaintenanceMode: isWithinInterval({
      currentTime,
      startTime: maintenanceDate && maintenanceDate.getTime(),
      duration: durationMs,
    }),
    dismissModal: () => setModalDismissedAt(new Date().toISOString()),
    dismissBanner,
    learnMoreLink,
  }
}
