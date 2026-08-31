import { enforce, skipWhen, test } from 'vest'
import { t } from '@evm-ui/lib/i18n'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { createValidationSuite } from '@evm-ui/lib/validation'
import type { CalendarDate } from '@internationalized/date'
import type { Decimal } from '@primitives/decimal.utils'
import type { CreateLockQuery } from './create-lock.types'

export const validateCreateLockAmount = (lockedAmount: Decimal | undefined) => {
  test('lockedAmount', t`Enter an amount to lock`, () => {
    enforce(lockedAmount).isNotEmpty()
  })
  test('lockedAmount', t`Enter an amount greater than zero`, () => {
    enforce(lockedAmount).isDecimal().gt(0)
  })
}

export const validateCreateLockDays = (days: number) => {
  test('days', t`Select a valid unlock date`, () => {
    enforce(days).gt(0)
  })
}

export const createLockFormValidationSuite = createValidationSuite(
  ({
    lockedAmount,
    maxLockedAmount,
    utcDate,
    days,
  }: {
    lockedAmount: Decimal | undefined
    maxLockedAmount: Decimal | undefined
    utcDate: CalendarDate | null
    days: number
  }) => {
    validateCreateLockAmount(lockedAmount)
    skipWhen(lockedAmount == null || maxLockedAmount == null, () => {
      test('maxLockedAmount', t`Amount exceeds maximum of ${maxLockedAmount}`, () => {
        enforce(lockedAmount).lte(maxLockedAmount)
      })
    })
    test('utcDate', t`Select a valid unlock date`, () => {
      enforce(utcDate).isNotEmpty()
    })
    validateCreateLockDays(days)
  },
)

const validateCreateLockQueryContext = ({
  chainId,
  userAddress,
  lockedAmount,
}: Pick<CreateLockQuery, 'chainId' | 'userAddress' | 'lockedAmount'>) => {
  curveApiValidationGroup({ chainId })
  userAddressValidationGroup({ userAddress })
  validateCreateLockAmount(lockedAmount)
}

export const createLockApprovalQueryValidationSuite = createValidationSuite(
  (params: Pick<CreateLockQuery, 'chainId' | 'userAddress' | 'lockedAmount'>) => {
    validateCreateLockQueryContext(params)
  },
)

export const createLockQueryValidationSuite = createValidationSuite(({ days, ...params }: CreateLockQuery) => {
  validateCreateLockQueryContext(params)
  validateCreateLockDays(days)
})
