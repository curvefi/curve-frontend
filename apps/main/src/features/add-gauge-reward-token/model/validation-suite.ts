import type { AddRewardFormValues } from '@/features/add-gauge-reward-token/types'
import { gaugeAddRewardTokenValidationGroup } from '@/entities/gauge'
import { createValidationSuite } from '@/shared/lib/validation'

export const addGaugeRewardTokenValidationSuite = createValidationSuite<AddRewardFormValues>(
  gaugeAddRewardTokenValidationGroup
)
