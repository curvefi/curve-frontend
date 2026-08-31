import { decimal, decimalGreaterThan, ZERO } from './decimal'

export const VECRV_MAX_LOCK_YEARS = 4
const DAYS_PER_YEAR = 365
export const VECRV_MAX_LOCK_DAYS = DAYS_PER_YEAR * VECRV_MAX_LOCK_YEARS

/** Whether or not a veCRV lock is expired and can be unlocked */
export const getIsLockExpired = (lockedAmount: string, unlockTime: number) =>
  decimalGreaterThan(decimal(lockedAmount) ?? ZERO, ZERO) && unlockTime > 0 && unlockTime < Date.now()
