import { enforce, skipWhen, test } from 'vest'
import { createValidationSuite } from '@evm-ui/lib/validation'
import { t } from '@ui/lib/i18n'
import type { RefuelFormValues } from '../types'

const hasAmount = ({ tokenAAmount, tokenBAmount }: RefuelFormValues) => !!tokenAAmount || !!tokenBAmount

const validateTokenAmount = (
  field: 'tokenAAmount' | 'tokenBAmount',
  amount: RefuelFormValues['tokenAAmount'],
  label: string,
) => {
  skipWhen(!amount, () => {
    test(field, t`${label} amount must be greater than 0`, () => {
      enforce(amount).isDecimal().gt(0)
    })
  })
}

export const refuelFormValidationSuite = createValidationSuite((values: RefuelFormValues) => {
  test('tokenAAmount', t`Enter at least one deposit amount`, () => {
    enforce(hasAmount(values)).isTruthy()
  })

  test('tokenBAmount', t`Enter at least one deposit amount`, () => {
    enforce(hasAmount(values)).isTruthy()
  })

  validateTokenAmount('tokenAAmount', values.tokenAAmount, 'Token A')
  validateTokenAmount('tokenBAmount', values.tokenBAmount, 'Token B')
})
