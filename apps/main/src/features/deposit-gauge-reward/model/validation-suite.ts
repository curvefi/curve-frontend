import { enforce, test } from 'vest'
import { DepositRewardStep, type DepositRewardFormValues } from '@main/features/deposit-gauge-reward/types'
import { gaugeDepositRewardValidationGroup } from '@main/entities/gauge'
import { createValidationSuite } from '@ui-kit/lib/validation'

const depositRewardValidationGroup = (data: DepositRewardFormValues) => {
  gaugeDepositRewardValidationGroup(data)
  test('step', () => {
    enforce(Object.values(DepositRewardStep).includes(data.step)).message('Invalid deposit reward step')
  })
}

export const depositRewardValidationSuite = createValidationSuite(depositRewardValidationGroup)
