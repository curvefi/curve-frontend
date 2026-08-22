import { AddRewardParams, gaugeAddRewardValidationGroup } from '@/dex/entities/gauge'
import { createValidationSuite } from '@evm-ui/lib/validation'

export const addGaugeRewardTokenValidationSuite = createValidationSuite((data: AddRewardParams) =>
  gaugeAddRewardValidationGroup(data),
)
