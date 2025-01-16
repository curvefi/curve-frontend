import { AddRewardParams, gaugeAddRewardValidationGroup } from '@/dex/entities/gauge'
import { createValidationSuite } from '@ui-kit/lib/validation'

export const addGaugeRewardTokenValidationSuite = createValidationSuite((data: AddRewardParams) =>
  gaugeAddRewardValidationGroup(data),
)
