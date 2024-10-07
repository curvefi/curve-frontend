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

import { assertGaugeValidity } from '@/entities/gauge/lib'
import { GaugeQueryKeyType, type PoolMethodResult } from '@/entities/gauge/types'
import useStore from '@/store/useStore'
import { type MutateFunction } from '@tanstack/react-query'

export const mutateAddRewardToken: MutateFunction<
  PoolMethodResult<'gauge.addReward'>,
  Error,
  GaugeQueryKeyType<'addRewardToken'>
> = async (queryKey) => {
  const [, chainId, , poolId, , , rewardTokenId, distributorId] = queryKey
  const _valid = assertGaugeValidity({ chainId, poolId, rewardTokenId, distributorId })

  const curve = useStore.getState().curve
  const pool = curve.getPool(_valid.poolId)
  return pool.gauge.addReward(_valid.rewardTokenId, _valid.distributorId)
}

export const mutateDepositRewardApprove: MutateFunction<
  PoolMethodResult<'gauge.depositRewardApprove'>,
  Error,
  GaugeQueryKeyType<'depositRewardApprove'>
> = async (queryKey) => {
  const [, chainId, , poolId, , , rewardTokenId, amount] = queryKey
  const _valid = assertGaugeValidity({ chainId, poolId, rewardTokenId, amount })

  const curve = useStore.getState().curve
  const pool = curve.getPool(_valid.poolId)
  return pool.gauge.depositRewardApprove(_valid.rewardTokenId, _valid.amount)
}

export const mutateDepositReward: MutateFunction<
  PoolMethodResult<'gauge.depositReward'>,
  Error,
  GaugeQueryKeyType<'depositReward'>
> = async (queryKey) => {
  const [, chainId, , poolId, , , rewardTokenId, amount, epoch] = queryKey
  const _valid = assertGaugeValidity({ chainId, poolId, rewardTokenId, amount, epoch })

  const curve = useStore.getState().curve
  const pool = curve.getPool(_valid.poolId)
  return pool.gauge.depositReward(_valid.rewardTokenId, _valid.amount, _valid.epoch)
}
