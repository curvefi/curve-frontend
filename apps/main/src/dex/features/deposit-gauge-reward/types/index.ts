import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'

export enum DepositRewardStep {
  APPROVAL = 'APPROVAL',
  DEPOSIT = 'DEPOSIT',
  CONFIRMATION = 'CONFIRMATION',
}

export type DepositRewardFormValues = {
  rewardTokenId: Address | undefined
  amount: Decimal | undefined
  userBalance: Decimal | undefined
  epoch: number | undefined
  step: DepositRewardStep
}
