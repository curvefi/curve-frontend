import { assertGaugeValidity } from '@/entities/gauge/lib'
import type { GaugeQueryKeyType, PoolMethodResult } from '@/entities/gauge/types'
import { BD } from '@/shared/curve-lib'
import useStore from '@/store/useStore'
import { logQuery } from '@/utils'
import type { QueryFunction } from '@tanstack/react-query'

export const queryEstimateGasDepositRewardApprove: QueryFunction<
  PoolMethodResult<'gauge.estimateGas.depositRewardApprove'>,
  GaugeQueryKeyType<'estimateGasDepositRewardApprove'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, chainId, , poolId, , , , rewardTokenId, amount] = queryKey
  const _valid = assertGaugeValidity({ chainId, poolId, rewardTokenId, amount })

  const curve = useStore.getState().curve
  const pool = curve.getPool(_valid.poolId)
  const strAmount = BD.from(_valid.amount).toString()
  return pool.gauge.estimateGas.depositRewardApprove(_valid.rewardTokenId, strAmount)
}

export const queryEstimateGasAddRewardToken: QueryFunction<
  PoolMethodResult<'gauge.estimateGas.addReward'>,
  GaugeQueryKeyType<'estimateGasAddRewardToken'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, chainId, , poolId, , , , rewardTokenId, distributorId] = queryKey
  const _valid = assertGaugeValidity({ chainId, poolId, rewardTokenId, distributorId })

  const curve = useStore.getState().curve
  const pool = curve.getPool(_valid.poolId)
  return pool.gauge.estimateGas.addReward(_valid.rewardTokenId, _valid.distributorId)
}

export const queryEstimateGasDepositReward: QueryFunction<
  PoolMethodResult<'gauge.estimateGas.depositReward'>,
  GaugeQueryKeyType<'estimateGasDepositReward'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, chainId, , poolId, , , , rewardTokenId, amount, epoch] = queryKey
  const _valid = assertGaugeValidity({ chainId, poolId, rewardTokenId, amount, epoch })

  const curve = useStore.getState().curve
  const pool = curve.getPool(_valid.poolId)
  const strAmount = BD.from(_valid.amount).toString()
  return pool.gauge.estimateGas.depositReward(_valid.rewardTokenId, strAmount, _valid.epoch)
}
