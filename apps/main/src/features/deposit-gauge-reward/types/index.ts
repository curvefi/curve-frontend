import { Address } from 'viem'
import type { CombinedGaugeParams } from '@/entities/gauge'

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
