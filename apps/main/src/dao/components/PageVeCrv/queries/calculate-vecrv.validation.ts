import { enforce, test } from 'vest'
import { t } from '@evm-ui/lib/i18n'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { createValidationSuite } from '@evm-ui/lib/validation'
import type { CalculateVeCrvQuery } from './calculate-vecrv.query'

export const calculateVeCrvValidationSuite = createValidationSuite(
  ({ chainId, lockedAmount, unlockTime }: CalculateVeCrvQuery) => {
    curveApiValidationGroup({ chainId })
    test('lockedAmount', t`Enter an amount greater than zero`, () => {
      enforce(lockedAmount).isDecimal().gt(0)
    })
    test('unlockTime', t`Select a valid unlock date`, () => {
      enforce(unlockTime).gt(0)
    })
  },
)
