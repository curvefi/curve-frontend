import { enforce, skipWhen, test } from 'vest'
import { t } from '@evm-ui/lib/i18n'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { createValidationSuite } from '@evm-ui/lib/validation'
import type { Decimal } from '@primitives/decimal.utils'
import type { IncreaseLockQuery } from './increase-lock.types'

export const validateIncreaseLockAmount = (lockedAmount: Decimal | undefined) => {
  test('lockedAmount', t`Enter an amount to lock`, () => {
    enforce(lockedAmount).isNotEmpty()
  })
  test('lockedAmount', t`Enter an amount greater than zero`, () => {
    enforce(lockedAmount).isDecimal().gt(0)
  })
}

export const increaseLockFormValidationSuite = createValidationSuite(
  ({ lockedAmount, maxLockedAmount }: { lockedAmount: Decimal | undefined; maxLockedAmount: Decimal | undefined }) => {
    validateIncreaseLockAmount(lockedAmount)
    skipWhen(lockedAmount == null || maxLockedAmount == null, () => {
      test('maxLockedAmount', t`The maximum lock amount is ${maxLockedAmount}`, () => {
        enforce(lockedAmount).lte(maxLockedAmount)
      })
    })
  },
)

const validateIncreaseLockQueryContext = ({ chainId, userAddress, lockedAmount }: IncreaseLockQuery) => {
  curveApiValidationGroup({ chainId })
  userAddressValidationGroup({ userAddress })
  validateIncreaseLockAmount(lockedAmount)
}

export const increaseLockQueryValidationSuite = createValidationSuite((params: IncreaseLockQuery) => {
  validateIncreaseLockQueryContext(params)
})
