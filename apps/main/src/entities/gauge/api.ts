import useStore from '@/store/useStore'
import { IDict } from '@curvefi/api/lib/interfaces'
import { QueryFunction, type MutateFunction } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { GaugeQueryKeyType } from './types'
import type { Address } from 'viem'
import { log } from '@/utils'

export const fetchGaugeStatus: QueryFunction<string, GaugeQueryKeyType<'status'>> = async ({ queryKey }) => {
  log('fetchGaugeStatus', queryKey)
  const [, , chain, poolId] = queryKey
  if (!chain || !poolId) throw new Error('Missing required parameters: chain or poolId')
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gaugeStatus()
}

export const fetchGaugeManager: QueryFunction<Address, GaugeQueryKeyType<'manager'>> = async ({ queryKey }) => {
  log('fetchGaugeManager', queryKey)
  const [, , chain, poolId] = queryKey
  if (!chain || !poolId) throw new Error('Missing required parameters: chain or poolId')
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  const gaugeManager = await pool.gauge.gaugeManager()
  if (!gaugeManager || gaugeManager === ethers.ZeroAddress) {
    throw new Error('Invalid gauge manager')
  }
  return gaugeManager as Address
}

export const fetchGaugeDistributors: QueryFunction<IDict<string>, GaugeQueryKeyType<'distributors'>> = async ({
  queryKey,
}) => {
  log('fetchGaugeDistributors', queryKey)
  const [, , chain, poolId] = queryKey
  if (!chain || !poolId) throw new Error('Missing required parameters: chain or poolId')
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gauge.gaugeDistributors()
}

export const fetchGaugeVersion: QueryFunction<string, GaugeQueryKeyType<'version'>> = async ({ queryKey }) => {
  log('fetchGaugeVersion', queryKey)
  const [, , chain, poolId] = queryKey
  if (!chain || !poolId) throw new Error('Missing required parameters: chain or poolId')
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  const version = await pool.gauge.gaugeVersion()
  if (version === null) throw new Error('Failed to fetch gauge version')
  return version
}

export const fetchIsDepositRewardAvailable: QueryFunction<
  boolean,
  GaugeQueryKeyType<'isDepositRewardAvailable'>
> = async ({ queryKey }) => {
  log('fetchIsDepositRewardAvailable', queryKey)
  const [, , chain, poolId] = queryKey
  if (!chain || !poolId) throw new Error('Missing required parameters: chain or poolId')
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gauge.isDepositRewardAvailable()
}

export const fetchDepositRewardIsApproved: QueryFunction<
  boolean,
  GaugeQueryKeyType<'depositRewardIsApproved'>
> = async ({ queryKey }) => {
  log('fetchDepositRewardIsApproved', queryKey)
  const [, , chain, poolId, token, amount] = queryKey
  if (!chain || !poolId || !token || !amount) throw new Error('Missing required parameters')
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gauge.depositRewardIsApproved(token, amount)
}

export const fetchEstimateGasDepositRewardApprove: QueryFunction<
  number | number[],
  GaugeQueryKeyType<'estimateGasDepositRewardApprove'>
> = async ({ queryKey }) => {
  log('fetchEstimateGasDepositRewardApprove', queryKey)
  const [, , , chain, poolId, token, amount] = queryKey
  if (!chain || !poolId || !token || !amount) throw new Error('Missing required parameters')
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gauge.estimateGas.depositRewardApprove(token, amount)
}

export const fetchEstimateGasAddRewardToken: QueryFunction<
  EstimatedGas,
  GaugeQueryKeyType<'estimateGasAddRewardToken'>
> = async ({ queryKey }) => {
  log('fetchEstimateGasAddRewardToken', queryKey)
  const [, , , chain, poolId, token, distributor] = queryKey
  if (!chain || !poolId || !token || !distributor) throw new Error('Missing required parameters')
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  const estimatedGas = await pool.gauge.estimateGas.addReward(token, distributor)
  if (estimatedGas === null) throw new Error('Failed to estimate gas')
  return estimatedGas
}

export const postAddRewardToken: MutateFunction<string, Error, GaugeQueryKeyType<'addRewardToken'>> = async (
  queryKey
) => {
  log('postAddRewardToken', queryKey)
  const [, , chain, poolId, token, distributor] = queryKey
  if (!chain || !poolId || !token || !distributor) throw new Error('Missing required parameters')
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gauge.addReward(token, distributor)
}
