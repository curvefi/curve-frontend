import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'

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
