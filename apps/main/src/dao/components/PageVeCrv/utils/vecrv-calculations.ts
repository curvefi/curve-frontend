import { toCalendarDate } from '@/dao/utils/utilsDates'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { dayjs } from '@evm-ui/lib/dayjs'
import { MILLISECONDS_PER_SECOND } from '@evm-ui/utils'
import { VECRV_MAX_LOCK_DAYS } from '@evm-ui/utils/vecrv'
import type { DateValue } from '@internationalized/date'
import { formatDate } from '@legacy-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes } from '@primitives/objects.utils'

/** Returns the Curve API rounded unlock timestamp for a lock duration. */
export const calcUnlockTime = ({ days, unlockTime }: { days: number | undefined; unlockTime: number | undefined }) =>
  maybe(days, days => (days ? requireLib('curveApi').boosting.calcUnlockTime(days, unlockTime) : undefined))

/** Returns the estimated veCRV for an amount and unlock timestamp. */
export const calculateVeCrv = ({
  lockedAmount,
  unlockTime,
}: {
  lockedAmount: Decimal | undefined
  unlockTime: number | undefined
}) =>
  maybes([lockedAmount, unlockTime], (lockedAmount, unlockTime) =>
    requireLib('curveApi').boosting.calculateVeCrv(lockedAmount, unlockTime),
  )

/** Builds the current, minimum, and maximum UTC dates for creating a lock. */
export const getCreateLockDates = (currentDate: Date) => {
  const currentUtcDate = dayjs.utc(currentDate)
  const currentUtcDay = currentUtcDate.startOf('day')
  return {
    currentUtcDate,
    currentUtcDay,
    minUtcDate: currentUtcDate,
    maxUtcDate: currentUtcDay.add(VECRV_MAX_LOCK_DAYS, 'day'),
  }
}

/** Converts a picked date into the stored UTC calendar date and day delta. */
export const getUnlockDateUpdate = (unlockDate: DateValue, baseUtcDate: dayjs.Dayjs) => {
  const utcDate = dayjs.utc(unlockDate.toString())
  return { utcDate: toCalendarDate(utcDate), days: utcDate.diff(baseUtcDate, 'd') }
}

/** Builds the create-lock form update from a quick action. */
export const getCreateQuickDateUpdate = ({
  currentUtcDay,
  maxUtcDate,
  unit,
  value,
}: {
  currentUtcDay: dayjs.Dayjs
  maxUtcDate: dayjs.Dayjs
  unit: dayjs.ManipulateType | undefined
  value: number | undefined
}) => {
  const targetDate = value && unit ? dayjs.utc().add(value, unit) : maxUtcDate
  const days = targetDate.diff(currentUtcDay, 'd')
  const unlockTime = calcUnlockTime({ days, unlockTime: undefined })
  const utcDate = dayjs.utc(unlockTime)
  return { utcDate: toCalendarDate(utcDate), quickActionValue: utcDate, days }
}

/** Builds the extend-lock form update from a quick action. */
export const getExtendQuickDateUpdate = ({
  currentDate,
  currentUnlockTime,
  currentUnlockUtcTime,
  maxUtcDate,
  unit,
  value,
}: {
  currentDate: Date
  currentUnlockTime: number | undefined
  currentUnlockUtcTime: dayjs.Dayjs | null | undefined
  maxUtcDate: dayjs.Dayjs | null
  unit: dayjs.ManipulateType | undefined
  value: number | undefined
}) => {
  if (!currentUnlockTime || !currentUnlockUtcTime || !maxUtcDate) {
    const utcDate = dayjs.utc(currentDate)
    return { utcDate: toCalendarDate(utcDate), quickActionValue: utcDate, days: 0 }
  }

  const targetDate = value && unit ? currentUnlockUtcTime.add(value, unit) : maxUtcDate
  const days = targetDate.diff(currentUnlockUtcTime, 'd')
  const unlockTime = calcUnlockTime({ days, unlockTime: currentUnlockTime })
  const utcDate = dayjs.utc(unlockTime)
  return { utcDate: toCalendarDate(utcDate), quickActionValue: utcDate, days }
}

/** Returns the whole-day remainder for an existing lock. */
export const getRemainingLockedDays = (
  currentUnlockUtcTime: dayjs.Dayjs | null | undefined,
  currentUtcDate: dayjs.Dayjs,
) =>
  maybe(currentUnlockUtcTime, currentUnlockUtcTime =>
    dayjs(currentUnlockUtcTime.format('YYYY-MM-DD')).diff(currentUtcDate.format('YYYY-MM-DD'), 'day', false),
  )

/** Returns the helper label when Curve will use a different unlock date. */
export const getEffectiveUnlockDateLabel = ({
  selectedDate,
  unlockTime,
}: {
  selectedDate: DateValue | null
  unlockTime: number | undefined
}) =>
  maybes([selectedDate, unlockTime], (selectedDate, unlockTime) =>
    dayjs.utc(selectedDate.toString()).isSame(dayjs.utc(unlockTime)) ? undefined : formatDate(unlockTime),
  )

/** Converts a DatePicker value into a UTC Unix timestamp in seconds. */
export const getDateValueTimestamp = (date: DateValue) =>
  Math.floor(dayjs.utc(date.toString()).valueOf() / MILLISECONDS_PER_SECOND)

/** Returns whether a quick action target is within the allowed date range. */
export const isQuickActionInRange = ({
  currentUnlockUtcTime,
  maxUtcDate,
  minUtcDate,
  unit,
  value,
}: {
  currentUnlockUtcTime: dayjs.Dayjs
  maxUtcDate: dayjs.Dayjs
  minUtcDate: dayjs.Dayjs
  unit: dayjs.ManipulateType
  value: number
}) => {
  const quickActionUtcDate = currentUnlockUtcTime.add(value, unit)
  return (
    (quickActionUtcDate.isSame(minUtcDate, 'd') || quickActionUtcDate.isAfter(minUtcDate, 'd')) &&
    (quickActionUtcDate.isSame(maxUtcDate, 'd') || quickActionUtcDate.isBefore(maxUtcDate, 'd'))
  )
}

/** veCRV unlocks are rounded to Thursday UTC week boundaries. */
export const isDateUnavailable = (date: DateValue) => {
  const todayUtcDate = dayjs.utc(date.toString()).day()
  const dayZeroUtcDate = dayjs.utc(new Date(0)).day()
  return todayUtcDate !== dayZeroUtcDate
}
