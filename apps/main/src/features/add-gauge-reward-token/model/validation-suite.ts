import { gaugeAddRewardTokenValidationGroup } from '@/entities/gauge'
import type { AddRewardFormValues } from '@/features/add-gauge-reward-token/types'
import { createValidationSuite } from '@/shared/validation'

export const addGaugeRewardTokenValidationSuite = createValidationSuite<AddRewardFormValues>(
  gaugeAddRewardTokenValidationGroup
)
