import { zeroAddress } from 'viem'
import { TIME_FRAMES } from '@main/constants'
import { DepositRewardStep, type DepositRewardFormValues } from '@main/features/deposit-gauge-reward/types'

export const DepositRewardDefaultValues: DepositRewardFormValues = {
  rewardTokenId: zeroAddress,
  amount: '',
  epoch: 1 * TIME_FRAMES.WEEK,
  step: DepositRewardStep.APPROVAL,
} as const
