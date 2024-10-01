import { gaugeAddRewardTokenValidationGroup } from '@/entities/gauge'
import type { AddRewardFormValues } from '@/features/add-gauge-reward-token/types'
import { createValidationSuite } from '@/shared/curve-lib'

export const addGaugeRewardTokenValidationSuite = createValidationSuite<AddRewardFormValues>(
  gaugeAddRewardTokenValidationGroup
)
