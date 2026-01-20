import type { Address } from 'viem'
import type { Decimal } from '@ui-kit/utils'

export enum DepositRewardStep {
  APPROVAL = 'APPROVAL',
  DEPOSIT = 'DEPOSIT',
  CONFIRMATION = 'CONFIRMATION',
}

export interface DepositRewardFormValues {
  rewardTokenId?: Address
  amount?: string
  userBalance?: Decimal
  epoch?: number
  step: DepositRewardStep
}
