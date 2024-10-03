import { gaugeDepositRewardValidationGroup } from '@/entities/gauge'
import { DepositRewardStep, type DepositRewardFormValues } from '@/features/deposit-gauge-reward/types'
import { createValidationSuite } from '@/shared/lib/validation'
import { enforce, test } from 'vest'

const depositRewardValidationGroup = <T extends DepositRewardFormValues>(data: T) => {
  gaugeDepositRewardValidationGroup(data)

  test('step', () => {
    enforce(Object.values(DepositRewardStep).includes(data.step)).message('Invalid deposit reward step')
  })
}

export const depositRewardValidationSuite = createValidationSuite<DepositRewardFormValues>(depositRewardValidationGroup)
