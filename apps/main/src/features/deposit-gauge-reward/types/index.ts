import type { CombinedGaugeParams } from '@/entities/gauge'
import { Address } from 'viem'

export enum DepositRewardStep {
  APPROVAL = 'APPROVAL',
  DEPOSIT = 'DEPOSIT',
  CONFIRMATION = 'CONFIRMATION',
}

export interface DepositRewardFormValues {
  rewardTokenId?: Address
  amount?: string
  epoch?: number
  step: DepositRewardStep
}

export type GaugeValidationSuite = CombinedGaugeParams & {
  step: DepositRewardStep
}
