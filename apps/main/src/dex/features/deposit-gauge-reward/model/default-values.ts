import { zeroAddress } from 'viem'
import { DepositRewardStep, type DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { TIME_FRAMES } from '@evm-ui/utils'

export const DepositRewardDefaultValues: DepositRewardFormValues = {
  rewardTokenId: zeroAddress,
  amount: '',
  userBalance: undefined,
  epoch: TIME_FRAMES.WEEK,
  step: DepositRewardStep.APPROVAL,
} as const
