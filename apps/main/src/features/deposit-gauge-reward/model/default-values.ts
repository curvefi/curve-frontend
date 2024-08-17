import { zeroAddress } from 'viem'
import { DepositRewardStep, type DepositRewardFormValues } from '@/features/deposit-gauge-reward/types'
import { TIME_FRAMES } from '@/constants'

export const DepositRewardDefaultValues: DepositRewardFormValues = {
  rewardTokenId: zeroAddress,
  amount: '',
  epoch: 1 * TIME_FRAMES.WEEK,
  step: DepositRewardStep.APPROVAL,
} as const
