import type { AddRewardQuery, DepositRewardApproveQuery, DepositRewardQuery } from '@main/entities/gauge/types'
import { BD } from '@ui-kit/utils'
import useStore from '@main/store/useStore'

export const queryEstimateGasDepositRewardApprove = async ({
  poolId,
  rewardTokenId,
  amount,
}: DepositRewardApproveQuery) => {
  const { curve } = useStore.getState()
  const pool = curve.getPool(poolId)
  const strAmount = BD.from(amount).toString()
  return pool.gauge.estimateGas.depositRewardApprove(rewardTokenId, strAmount)
}

export const queryEstimateGasAddRewardToken = async ({ poolId, rewardTokenId, distributorId }: AddRewardQuery) => {
  const { curve } = useStore.getState()
  const pool = curve.getPool(poolId)
  return pool.gauge.estimateGas.addReward(rewardTokenId, distributorId)
}

export const queryEstimateGasDepositReward = async ({ poolId, rewardTokenId, amount, epoch }: DepositRewardQuery) => {
  const { curve } = useStore.getState()
  const pool = curve.getPool(poolId)
  const strAmount = BD.from(amount).toString()
  return pool.gauge.estimateGas.depositReward(rewardTokenId, strAmount, epoch)
}
