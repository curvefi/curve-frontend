import { enforce, skipWhen, test } from 'vest'
import { t } from '@ui-kit/lib/i18n'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { REFUEL_CONFIGURATIONS, type RefuelFormValues } from '../types'

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
  test('configuration', t`Invalid refuel configuration`, () => {
    enforce(REFUEL_CONFIGURATIONS.includes(values.configuration)).isTruthy()
  })

  test('targetRefuelPercentage', t`Target refuel percentage is required`, () => {
    enforce(values.targetRefuelPercentage).isNotEmpty()
  })

  skipWhen(!values.targetRefuelPercentage, () => {
    test('targetRefuelPercentage', t`Target refuel percentage must be a number`, () => {
      enforce(values.targetRefuelPercentage).isNumeric()
    })

    test('targetRefuelPercentage', t`Target refuel percentage must be a whole number`, () => {
      enforce(Number.isInteger(Number(values.targetRefuelPercentage))).isTruthy()
    })

    test('targetRefuelPercentage', t`Target refuel percentage must be at least 0%`, () => {
      enforce(values.targetRefuelPercentage).gte(0)
    })

    test('targetRefuelPercentage', t`Target refuel percentage cannot exceed 100%`, () => {
      enforce(values.targetRefuelPercentage).lte(100)
    })
  })

  test('tokenAAmount', t`Enter at least one deposit amount`, () => {
    enforce(hasAmount(values)).isTruthy()
  })

  test('tokenBAmount', t`Enter at least one deposit amount`, () => {
    enforce(hasAmount(values)).isTruthy()
  })

  validateTokenAmount('tokenAAmount', values.tokenAAmount, 'Token A')
  validateTokenAmount('tokenBAmount', values.tokenBAmount, 'Token B')
})
