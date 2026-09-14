import { test } from 'vest'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { getIsLockExpired } from '@evm-ui/utils/vecrv'
import { t } from '@ui/lib/i18n'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { WithdrawLockQuery } from './withdraw-lock.types'

export const withdrawLockValidationSuite = createValidationSuite((params: WithdrawLockQuery) => {
  curveApiValidationGroup({ chainId: params.chainId })
  userAddressValidationGroup({ userAddress: params.userAddress })
  test('unlockTime', t`Your CRV lock has not expired`, () => {
    enforce(getIsLockExpired(params.lockedAmount, params.unlockTime)).isTruthy()
  })
})
