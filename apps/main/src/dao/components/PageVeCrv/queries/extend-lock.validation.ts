import { enforce, skipWhen, test } from 'vest'
import { t } from '@evm-ui/lib/i18n'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { createValidationSuite } from '@evm-ui/lib/validation'
import type { CalendarDate } from '@internationalized/date'
import type { ExtendLockQuery } from './extend-lock.types'

export const validateExtendLockDays = (days: number) => {
  test('days', t`Select a valid unlock date`, () => {
    enforce(days).gt(0)
  })
}

export const extendLockFormValidationSuite = createValidationSuite(
  ({
    utcDate,
    days,
    minUnlockDate,
    maxUnlockDate,
  }: {
    utcDate: CalendarDate | null
    days: number
    minUnlockDate: CalendarDate | null
    maxUnlockDate: CalendarDate | null
  }) => {
    test('utcDate', t`Select a valid unlock date`, () => {
      enforce(utcDate).isNotEmpty()
    })
    validateExtendLockDays(days)
    skipWhen(utcDate == null || minUnlockDate == null || maxUnlockDate == null, () => {
      test('utcDate', t`Select a valid unlock date`, () => {
        enforce(utcDate!.compare(minUnlockDate!)).gte(0)
        enforce(utcDate!.compare(maxUnlockDate!)).lte(0)
      })
    })
  },
)

export const extendLockQueryValidationSuite = createValidationSuite(
  ({ chainId, userAddress, days }: ExtendLockQuery) => {
    curveApiValidationGroup({ chainId })
    userAddressValidationGroup({ userAddress })
    validateExtendLockDays(days)
  },
)
