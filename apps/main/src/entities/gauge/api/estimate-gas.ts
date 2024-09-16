import { assertGaugeValidity } from '@/entities/gauge/lib'
import type { GaugeQueryKeyType } from '@/entities/gauge/types'
import { BD } from '@/shared/curve-lib'
import { logQuery } from '@/utils'
import type { QueryFunction } from '@tanstack/react-query'
import { getPool } from '@/entities/pool/api/pool-api'
import { PoolMethodResult } from '@/entities/pool'

export const queryEstimateGasDepositRewardApprove: QueryFunction<
  PoolMethodResult<'gauge.estimateGas.depositRewardApprove'>,
  GaugeQueryKeyType<'estimateGasDepositRewardApprove'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, chainId, , poolId, , , , rewardTokenId, amount] = queryKey
  const _valid = assertGaugeValidity({ chainId, poolId, rewardTokenId, amount })

  const { gauge } = getPool(_valid.poolId)
  const strAmount = BD.from(_valid.amount).toString()
  return gauge.estimateGas.depositRewardApprove(_valid.rewardTokenId, strAmount)
}

export const queryEstimateGasAddRewardToken: QueryFunction<
  PoolMethodResult<'gauge.estimateGas.addReward'>,
  GaugeQueryKeyType<'estimateGasAddRewardToken'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, chainId, , poolId, , , , rewardTokenId, distributorId] = queryKey
  const _valid = assertGaugeValidity({ chainId, poolId, rewardTokenId, distributorId })

  const { gauge } = getPool(_valid.poolId)
  return gauge.estimateGas.addReward(_valid.rewardTokenId, _valid.distributorId)
}

export const queryEstimateGasDepositReward: QueryFunction<
  PoolMethodResult<'gauge.estimateGas.depositReward'>,
  GaugeQueryKeyType<'estimateGasDepositReward'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, chainId, , poolId, , , , rewardTokenId, amount, epoch] = queryKey
  const _valid = assertGaugeValidity({ chainId, poolId, rewardTokenId, amount, epoch })

  const { gauge } = getPool(_valid.poolId)
  const strAmount = BD.from(_valid.amount).toString()
  return gauge.estimateGas.depositReward(_valid.rewardTokenId, strAmount, _valid.epoch)
}
