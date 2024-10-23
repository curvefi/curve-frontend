/**
 * @file entities/gauge/api.ts
 * @description This file contains API functions for fetching and manipulating gauge-related data.
 * It serves as part of the 'gauge' entity in the FSD architecture.
 *
 * The functions in this file interact with the Curve.fi protocol and are typically used
 * in conjunction with React Query for state management in the application.
 * Other files in the 'gauge' entity may use these functions to handle gauge-specific
 * business logic and data fetching.
 */

import { AddRewardQuery, DepositRewardApproveQuery, DepositRewardQuery } from '@/entities/gauge/types'
import useStore from '@/store/useStore'

export const mutateAddRewardToken = async ({ poolId, rewardTokenId, distributorId }: AddRewardQuery): Promise<string> => {
  const { curve } = useStore.getState()
  console.log('mutateAddRewardToken', poolId, rewardTokenId, distributorId)
  const pool = curve.getPool(poolId)
  return pool.gauge.addReward(rewardTokenId, distributorId)
}

export const mutateDepositRewardApprove = async ({ poolId, rewardTokenId, amount }: DepositRewardApproveQuery): Promise<string[]> => {
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gauge.depositRewardApprove(rewardTokenId, amount)
}

export const mutateDepositReward = async ({ poolId, rewardTokenId, amount, epoch }: DepositRewardQuery): Promise<string> => {
  const { curve } = useStore.getState()
  const pool = curve.getPool(poolId)
  return pool.gauge.depositReward(rewardTokenId, amount, epoch)
}
