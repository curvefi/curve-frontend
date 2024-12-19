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

import { type Address, zeroAddress } from 'viem'
import { DepositRewardApproveQuery } from '@/entities/gauge/types'
import { BD } from '@/shared/curve-lib'
import { GaugeQuery } from '@/shared/model/query'
import useStore from '@/store/useStore'

export const queryGaugeStatus = async ({ poolId }: GaugeQuery) => {
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gaugeStatus()
}

export const queryGaugeManager = async ({ poolId }: GaugeQuery): Promise<Address | null> => {
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  const gaugeManager = (await pool.gauge.gaugeManager()) as Address | null
  if (!gaugeManager || gaugeManager === zeroAddress) {
    return null
  }
  return gaugeManager
}

export const queryGaugeDistributors = async ({ poolId }: GaugeQuery) => {
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gauge.gaugeDistributors()
}

export const queryGaugeVersion = async ({ poolId }: GaugeQuery) => {
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return (await pool.gauge.gaugeVersion()) ?? null
}

export const queryIsDepositRewardAvailable = async ({ poolId }: GaugeQuery) => {
  const { curve } = useStore.getState()
  const pool = curve.getPool(poolId)
  return pool.gauge.isDepositRewardAvailable()
}

export const queryDepositRewardIsApproved = async ({ poolId, amount, rewardTokenId }: DepositRewardApproveQuery) => {
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  const strAmount = BD.from(amount).toString()
  return pool.gauge.depositRewardIsApproved(rewardTokenId, strAmount)
}
