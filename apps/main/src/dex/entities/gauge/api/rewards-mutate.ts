import { getGauge } from '@/dex/entities/gauge/api/gauge-query'
import { AddRewardQuery, DepositRewardApproveQuery, DepositRewardQuery } from '@/dex/entities/gauge/types'

export const mutateAddRewardToken = async ({ poolId, rewardTokenId, distributorId }: AddRewardQuery): Promise<string> =>
  getGauge(poolId).addReward(rewardTokenId, distributorId)

export const mutateDepositRewardApprove = async ({
  poolId,
  rewardTokenId,
  amount,
}: DepositRewardApproveQuery): Promise<string[]> => getGauge(poolId).depositRewardApprove(rewardTokenId, amount)

export const mutateDepositReward = async ({
  poolId,
  rewardTokenId,
  amount,
  epoch,
}: DepositRewardQuery): Promise<string> => getGauge(poolId).depositReward(rewardTokenId, amount, epoch)
