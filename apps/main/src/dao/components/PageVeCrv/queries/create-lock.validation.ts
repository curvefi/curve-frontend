import { enforce, skipWhen, test } from 'vest'
import { t } from '@evm-ui/lib/i18n'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { createValidationSuite } from '@evm-ui/lib/validation'
import type { CalendarDate } from '@internationalized/date'
import type { Decimal } from '@primitives/decimal.utils'
import type { CreateLockQuery } from './create-lock.types'

export const validateCreateLockAmount = (lockedAmt: Decimal | undefined) => {
  test('lockedAmt', t`Enter an amount to lock`, () => {
    enforce(lockedAmt).isNotEmpty()
  })
  test('lockedAmt', t`Enter an amount greater than zero`, () => {
    enforce(lockedAmt).isDecimal().gt(0)
  })
}

export const validateCreateLockDays = (days: number) => {
  test('days', t`Select a valid unlock date`, () => {
    enforce(days).gt(0)
  })
}

export const createLockFormValidationSuite = createValidationSuite(
  ({
    lockedAmt,
    maxLockedAmt,
    utcDate,
    days,
  }: {
    lockedAmt: Decimal | undefined
    maxLockedAmt: Decimal | undefined
    utcDate: CalendarDate | null
    days: number
  }) => {
    validateCreateLockAmount(lockedAmt)
    skipWhen(lockedAmt == null || maxLockedAmt == null, () => {
      test('maxLockedAmt', t`Amount exceeds maximum of ${maxLockedAmt}`, () => {
        enforce(lockedAmt).lte(maxLockedAmt)
      })
    })
    test('utcDate', t`Select a valid unlock date`, () => {
      enforce(utcDate).isNotEmpty()
    })
    validateCreateLockDays(days)
  },
)

export const createLockApproveValidationSuite = createValidationSuite(({ lockedAmt }: { lockedAmt: Decimal }) => {
  validateCreateLockAmount(lockedAmt)
})

const validateCreateLockQueryContext = (params: Pick<CreateLockQuery, 'chainId' | 'userAddress' | 'lockedAmt'>) => {
  curveApiValidationGroup({ chainId: params.chainId })
  userAddressValidationGroup({ userAddress: params.userAddress })
  validateCreateLockAmount(params.lockedAmt)
}

export const createLockApprovalQueryValidationSuite = createValidationSuite(
  (params: Pick<CreateLockQuery, 'chainId' | 'userAddress' | 'lockedAmt'>) => {
    validateCreateLockQueryContext(params)
  },
)

export const createLockQueryValidationSuite = createValidationSuite((params: CreateLockQuery) => {
  validateCreateLockQueryContext(params)
  validateCreateLockDays(params.days)
})
