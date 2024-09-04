/**
 * @file entities/gauge/types.ts
 * @description This file defines TypeScript types and interfaces related to gauges in the Curve.fi DApp.
 * It's part of the 'gauge' entity in the FSD architecture.
 *
 * The types defined here are used throughout the gauge-related components and functions,
 * ensuring type safety and consistency in gauge operations.
 *
 * These types are essential for maintaining a well-typed codebase and improving
 * developer experience when working with gauge-related functionality.
 */

import { gaugeKeys } from '@/entities/gauge/model'
import type { PoolMethodParameters, PoolQueryParams } from '@/entities/pool/types'
import { ExtractQueryKeyType } from '@/shared/types/api'
import type { Address } from 'viem'

export type GaugeQueryKeyType<K extends keyof typeof gaugeKeys> = ExtractQueryKeyType<typeof gaugeKeys, K>

export type GaugeQueryParams = PoolQueryParams & {}

export type AddRewardParams<T extends Array<any> = PoolMethodParameters<'gauge.addReward'>> = {
  rewardTokenId?: Address //T[0]
  distributorId?: Address //T[1]
}

export type DepositRewardApproveParams<T extends Array<any> = PoolMethodParameters<'gauge.depositRewardApprove'>> = {
  rewardTokenId?: Address //T[0]
  amount?: T[1]
}

export type DepositRewardParams<T extends Array<any> = PoolMethodParameters<'gauge.depositReward'>> = {
  rewardTokenId?: Address //T[0]
  amount?: T[1]
  epoch?: T[2]
}

export type CombinedGaugeParams = GaugeQueryParams & AddRewardParams & DepositRewardApproveParams & DepositRewardParams
