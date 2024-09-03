import { gaugeValidationGroup } from '@/entities/gauge'
import { createValidationSuite } from '@/shared/validation'
import type { AddRewardFormValues } from '@/features/add-gauge-reward-token/types'

export const addGaugeRewardTokenValidationSuite = createValidationSuite<AddRewardFormValues>(gaugeValidationGroup)
