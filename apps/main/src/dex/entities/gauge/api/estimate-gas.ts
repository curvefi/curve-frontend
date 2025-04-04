import type { AddRewardQuery, DepositRewardApproveQuery, DepositRewardQuery } from '@/dex/entities/gauge/types'
import { useApiStore } from '@ui-kit/shared/useApiStore'
import { BD } from '@ui-kit/utils'

export const queryEstimateGasDepositRewardApprove = async ({
  poolId,
  rewardTokenId,
  amount,
}: DepositRewardApproveQuery) => {
  const curve = useApiStore.getState().curve!
  const pool = curve.getPool(poolId)
  const strAmount = BD.from(amount).toString()
  return pool.gauge.estimateGas.depositRewardApprove(rewardTokenId, strAmount)
}

export const queryEstimateGasAddRewardToken = async ({ poolId, rewardTokenId, distributorId }: AddRewardQuery) => {
  const curve = useApiStore.getState().curve!
  const pool = curve.getPool(poolId)
  return pool.gauge.estimateGas.addReward(rewardTokenId, distributorId)
}

export const queryEstimateGasDepositReward = async ({ poolId, rewardTokenId, amount, epoch }: DepositRewardQuery) => {
  const curve = useApiStore.getState().curve!
  const pool = curve.getPool(poolId)
  const strAmount = BD.from(amount).toString()
  return pool.gauge.estimateGas.depositReward(rewardTokenId, strAmount, epoch)
}
