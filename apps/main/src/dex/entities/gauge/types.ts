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

import type { Address } from 'viem'
import { FieldsOf } from '@ui-kit/lib/validation'
import { GaugeQuery } from '@ui-kit/lib/model/query'

export type AddReward = {
  rewardTokenId: Address
  distributorId: Address
}
export type AddRewardQuery = GaugeQuery & AddReward
export type AddRewardParams = FieldsOf<AddRewardQuery>
export type AddRewardMutation = FieldsOf<AddReward>

export type DepositRewardApprove = {
  rewardTokenId: Address
  amount: number | string
}
export type DepositRewardApproveQuery = GaugeQuery & DepositRewardApprove
export type DepositRewardApproveParams = FieldsOf<DepositRewardApproveQuery>
export type DepositRewardApproveMutation = FieldsOf<DepositRewardApprove>

export type DepositReward = DepositRewardApprove & {
  epoch: number | string
}
export type DepositRewardQuery = GaugeQuery & DepositReward
export type DepositRewardParams = FieldsOf<DepositRewardQuery>
export type DepositRewardMutation = FieldsOf<DepositReward>
