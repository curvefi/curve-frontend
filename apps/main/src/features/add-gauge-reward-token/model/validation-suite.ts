import { AddRewardParams, gaugeAddRewardValidationGroup } from '@/entities/gauge'
import { createValidationSuite } from '@/shared/lib/validation'

export const addGaugeRewardTokenValidationSuite =  createValidationSuite((data: AddRewardParams) => gaugeAddRewardValidationGroup(data));
