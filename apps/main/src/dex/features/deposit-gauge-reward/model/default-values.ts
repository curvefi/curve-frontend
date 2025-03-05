import { zeroAddress } from 'viem'
import { TIME_FRAMES } from '@/dex/constants'
import { DepositRewardStep, type DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'

export const DepositRewardDefaultValues: DepositRewardFormValues = {
  rewardTokenId: zeroAddress,
  amount: '',
  epoch: TIME_FRAMES.WEEK,
  step: DepositRewardStep.APPROVAL,
} as const
