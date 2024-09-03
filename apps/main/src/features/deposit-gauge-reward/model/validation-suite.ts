import { gaugeValidationGroup } from '@/entities/gauge'
import { createValidationSuite } from '@/shared/validation'
import { DepositRewardStep, type DepositRewardFormValues } from '@/features/deposit-gauge-reward/types'
import { enforce, test } from 'vest'

const depositRewardValidationGroup = (data: DepositRewardFormValues) => {
  gaugeValidationGroup(data)

  test('step', 'Invalid deposit reward step', () => {
    enforce(Object.values(DepositRewardStep).includes(data.step)).isTruthy()
  })
}

export const depositRewardValidationSuite = createValidationSuite<DepositRewardFormValues>(depositRewardValidationGroup)
