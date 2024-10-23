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

import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { Address } from 'viem'
import { gaugeKeys } from '@/entities/gauge/model'
import { FieldsOf } from '@/shared/lib/validation'
import { GaugeParams, GaugeQuery, PoolQuery } from '@/shared/model/query'
import type { ExtractQueryKeyType } from '@/shared/types/api'
import type { NestedFunction, NestedKeys } from '@/shared/types/nested'

export type PoolMethodResult<M extends NestedKeys<PoolTemplate>> = Awaited<ReturnType<NestedFunction<PoolTemplate, M>>>

export type GaugeQueryKeyType<K extends keyof typeof gaugeKeys> = ExtractQueryKeyType<typeof gaugeKeys, K>

export type AddRewardQuery = PoolQuery & {
  rewardTokenId: Address
  distributorId: Address
}
export type AddRewardParams = FieldsOf<AddRewardQuery>

export type DepositRewardApproveQuery = PoolQuery & {
  rewardTokenId: Address
  amount: number | string
}
export type DepositRewardApproveParams = FieldsOf<DepositRewardApproveQuery>

export type DepositRewardQuery = PoolQuery & {
  rewardTokenId: Address
  amount: number | string
  epoch: number | string
}
export type DepositRewardParams = FieldsOf<DepositRewardQuery>

type Nullable<T> = {[K in keyof T]?: T[K] | null} // todo: get rid of this after implementing query factory
export type CombinedGaugeParams = Nullable<GaugeQuery> & AddRewardParams & DepositRewardApproveParams & DepositRewardParams
