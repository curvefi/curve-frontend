import type { GaugeQueryKeyType, PoolMethodResult } from '@/entities/gauge/types'
import { BD } from '@/shared/curve-lib'
import useStore from '@/store/useStore'
import { logQuery } from '@/utils'
import type { QueryFunction } from '@tanstack/react-query'
import { isAddress } from 'viem'

export const queryEstimateGasDepositRewardApprove: QueryFunction<
  PoolMethodResult<'gauge.estimateGas.depositRewardApprove'>,
  GaugeQueryKeyType<'estimateGasDepositRewardApprove'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, , , , , chainId, poolId, token, amount] = queryKey
  if (!chainId || !poolId || !token || !isAddress(token) || !amount) throw new Error('Missing required parameters')

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  const strAmount = BD.from(amount).toString()
  return pool.gauge.estimateGas.depositRewardApprove(token, strAmount)
}

export const queryEstimateGasAddRewardToken: QueryFunction<
  PoolMethodResult<'gauge.estimateGas.addReward'>,
  GaugeQueryKeyType<'estimateGasAddRewardToken'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, , , , , chainId, poolId, token, distributor] = queryKey
  if (!chainId || !poolId || !token || !isAddress(token) || !distributor) throw new Error('Missing required parameters')

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gauge.estimateGas.addReward(token, distributor)
}

export const queryEstimateGasDepositReward: QueryFunction<
  PoolMethodResult<'gauge.estimateGas.depositReward'>,
  GaugeQueryKeyType<'estimateGasDepositReward'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, , , , , chainId, poolId, token, amount, epoch] = queryKey
  if (!chainId || !poolId || !token || !isAddress(token) || !amount || !epoch)
    throw new Error('Missing required parameters')

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  const strAmount = BD.from(amount).toString()
  return pool.gauge.estimateGas.depositReward(token, strAmount, epoch)
}
