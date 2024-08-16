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
import { BD } from '@/shared/curve-lib'
import useStore from '@/store/useStore'
import { logQuery } from '@/utils'
import { QueryFunction } from '@tanstack/react-query'
import { isAddress, zeroAddress, type Address } from 'viem'

export const queryGaugeStatus: QueryFunction<PoolMethodResult<'gaugeStatus'>, GaugeQueryKeyType<'status'>> = async ({
  queryKey,
}) => {
  logQuery(queryKey)
  const [, , , , chainId, poolId] = queryKey
  if (!chainId || !poolId) throw new Error('Missing required parameters: chainId or poolId')

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gaugeStatus()
}

export const queryGaugeManager: QueryFunction<
  Address | undefined, // PoolMethodResult<'gauge.gaugeManager'>,
  GaugeQueryKeyType<'manager'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, , , , chainId, poolId] = queryKey
  if (!chainId || !poolId) throw new Error('Missing required parameters: chainId or poolId')

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  const gaugeManager = (await pool.gauge.gaugeManager()) as Address | null
  if (!gaugeManager || gaugeManager === zeroAddress) {
    return undefined
  }
  return gaugeManager
}

export const queryGaugeDistributors: QueryFunction<
  PoolMethodResult<'gauge.gaugeDistributors'>,
  GaugeQueryKeyType<'distributors'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, , , , chainId, poolId] = queryKey
  if (!chainId || !poolId) throw new Error('Missing required parameters: chainId or poolId')

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gauge.gaugeDistributors()
}

export const queryGaugeVersion: QueryFunction<
  PoolMethodResult<'gauge.gaugeVersion'>,
  GaugeQueryKeyType<'version'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, , , , chainId, poolId] = queryKey
  if (!chainId || !poolId) throw new Error('Missing required parameters: chainId or poolId')

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  const version = await pool.gauge.gaugeVersion()
  return version ?? null
}

export const queryIsDepositRewardAvailable: QueryFunction<
  PoolMethodResult<'gauge.isDepositRewardAvailable'>,
  GaugeQueryKeyType<'isDepositRewardAvailable'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, , , , chainId, poolId] = queryKey
  if (!chainId || !poolId) throw new Error('Missing required parameters: chainId or poolId')

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gauge.isDepositRewardAvailable()
}

export const queryDepositRewardIsApproved: QueryFunction<
  PoolMethodResult<'gauge.depositRewardIsApproved'>,
  GaugeQueryKeyType<'depositRewardIsApproved'>
> = async ({ queryKey }) => {
  logQuery(queryKey)
  const [, , , , chainId, poolId, token, amount] = queryKey
  if (!chainId || !poolId || !token || !isAddress(token) || !amount) throw new Error('Missing required parameters')

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  const strAmount = BD.from(amount).toString()
  return pool.gauge.depositRewardIsApproved(token, strAmount)
}
