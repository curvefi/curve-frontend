import { AddRewardQuery, DepositRewardApproveQuery, DepositRewardQuery } from '@/dex/entities/gauge/types'
import { useApiStore } from '@ui-kit/shared/useApiStore'

export const mutateAddRewardToken = async ({
  poolId,
  rewardTokenId,
  distributorId,
}: AddRewardQuery): Promise<string> => {
  const curve = useApiStore.getState().curve!
  const pool = curve.getPool(poolId)
  return pool.gauge.addReward(rewardTokenId, distributorId)
}

export const mutateDepositRewardApprove = async ({
  poolId,
  rewardTokenId,
  amount,
}: DepositRewardApproveQuery): Promise<string[]> => {
  const curve = useApiStore.getState().curve!
  const pool = curve.getPool(poolId)
  return pool.gauge.depositRewardApprove(rewardTokenId, amount)
}

export const mutateDepositReward = async ({
  poolId,
  rewardTokenId,
  amount,
  epoch,
}: DepositRewardQuery): Promise<string> => {
  const curve = useApiStore.getState().curve!
  const pool = curve.getPool(poolId)
  return pool.gauge.depositReward(rewardTokenId, amount, epoch)
}
