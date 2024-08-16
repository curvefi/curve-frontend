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

import { GaugeQueryKeyType, type PoolMethodResult } from '@/entities/gauge/types'
import useStore from '@/store/useStore'
import { type MutateFunction } from '@tanstack/react-query'

export const mutateAddRewardToken: MutateFunction<
  PoolMethodResult<'gauge.addReward'>,
  Error,
  GaugeQueryKeyType<'addRewardToken'>
> = async (queryKey) => {
  const [, , , , chainId, poolId, token, distributor] = queryKey
  if (!chainId || !poolId || !token || !distributor) throw new Error('Missing required parameters')
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gauge.addReward(token, distributor)
}

export const mutateDepositRewardApprove: MutateFunction<
  PoolMethodResult<'gauge.depositRewardApprove'>,
  Error,
  GaugeQueryKeyType<'depositRewardApprove'>
> = async (queryKey) => {
  const [, , , , chainId, poolId, token, amount] = queryKey
  if (!chainId || !poolId || !token || !amount) throw new Error('Missing required parameters')
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gauge.depositRewardApprove(token, amount)
}

export const mutateDepositReward: MutateFunction<
  PoolMethodResult<'gauge.depositReward'>,
  Error,
  GaugeQueryKeyType<'depositReward'>
> = async (queryKey) => {
  const [, , , , chainId, poolId, token, amount, epoch] = queryKey
  if (!chainId || !poolId || !token || !amount || !epoch) throw new Error('Missing required parameters')
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gauge.depositReward(token, amount, epoch)
}
