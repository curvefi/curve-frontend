import { getGauge } from '@/dex/entities/gauge/api/gauge-query'
import type { AddRewardQuery, DepositRewardApproveQuery, DepositRewardQuery } from '@/dex/entities/gauge/types'

export const queryEstimateGasDepositRewardApprove = async ({
  poolId,
  rewardTokenId,
  amount,
}: DepositRewardApproveQuery) => getGauge(poolId).estimateGas.depositRewardApprove(rewardTokenId, amount)

export const queryEstimateGasAddRewardToken = async ({ poolId, rewardTokenId, distributorId }: AddRewardQuery) =>
  getGauge(poolId).estimateGas.addReward(rewardTokenId, distributorId)

export const queryEstimateGasDepositReward = async ({ poolId, rewardTokenId, amount, epoch }: DepositRewardQuery) =>
  getGauge(poolId).estimateGas.depositReward(rewardTokenId, amount, epoch)
