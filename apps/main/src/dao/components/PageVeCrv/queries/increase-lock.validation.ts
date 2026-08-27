import { enforce, skipWhen, test } from 'vest'
import { t } from '@evm-ui/lib/i18n'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { createValidationSuite } from '@evm-ui/lib/validation'
import type { Decimal } from '@primitives/decimal.utils'
import type { IncreaseLockQuery } from './increase-lock.types'

export const validateIncreaseLockAmount = (lockedAmt: Decimal | undefined) => {
  test('lockedAmt', t`Enter an amount to lock`, () => {
    enforce(lockedAmt).isNotEmpty()
  })
  test('lockedAmt', t`Enter an amount greater than zero`, () => {
    enforce(lockedAmt).isDecimal().gt(0)
  })
}

export const increaseLockFormValidationSuite = createValidationSuite(
  ({ lockedAmt, maxLockedAmt }: { lockedAmt: Decimal | undefined; maxLockedAmt: Decimal | undefined }) => {
    validateIncreaseLockAmount(lockedAmt)
    skipWhen(lockedAmt == null || maxLockedAmt == null, () => {
      test('maxLockedAmt', t`Amount exceeds maximum of ${maxLockedAmt}`, () => {
        enforce(lockedAmt).lte(maxLockedAmt)
      })
    })
  },
)

const validateIncreaseLockQueryContext = (params: IncreaseLockQuery) => {
  curveApiValidationGroup({ chainId: params.chainId })
  userAddressValidationGroup({ userAddress: params.userAddress })
  validateIncreaseLockAmount(params.lockedAmt)
}

export const increaseLockQueryValidationSuite = createValidationSuite((params: IncreaseLockQuery) => {
  validateIncreaseLockQueryContext(params)
})
