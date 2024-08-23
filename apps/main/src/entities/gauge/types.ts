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
import { ExtractQueryKeys, ExtractQueryKeyType } from '@/shared/types/api'
import type { NestedKeys, NestedProperty } from '@/shared/types/nested'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { PoolQueryParams } from '@/entities/pool/types'

export type PoolMethodResult<M extends NestedKeys<PoolTemplate>> = Awaited<ReturnType<NestedProperty<PoolTemplate, M>>>

export type PoolMethodParameters<M extends NestedKeys<PoolTemplate>> = Parameters<NestedProperty<PoolTemplate, M>>

export type GaugeQueryKeys = ExtractQueryKeys<typeof gaugeKeys>

export type GaugeQueryKeyType<K extends keyof typeof gaugeKeys> = ExtractQueryKeyType<typeof gaugeKeys, K>

export type GaugeQueryParams = PoolQueryParams & {}

export type AddRewardParams<T extends Array<any> = PoolMethodParameters<'gauge.addReward'>> = {
  rewardTokenId?: T[0]
  distributorId?: T[1]
}

export type DepositRewardApproveParams<T extends Array<any> = PoolMethodParameters<'gauge.depositRewardApprove'>> = {
  rewardTokenId?: T[0]
  amount?: T[1]
}
export type DepositRewardParams<T extends Array<any> = PoolMethodParameters<'gauge.depositReward'>> = {
  rewardTokenId?: T[0]
  amount?: T[1]
  epoch?: T[2]
}
