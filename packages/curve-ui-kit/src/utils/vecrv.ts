/** Whether or not a veCRV lock is expired and can be unlocked */
export const getIsLockExpired = (lockedAmount: string, unlockTime: number) =>
  +lockedAmount > 0 && unlockTime > 0 && unlockTime < Date.now()
