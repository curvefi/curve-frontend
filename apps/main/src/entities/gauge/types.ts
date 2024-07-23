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

import { gaugeKeys } from './query-keys'

export type GaugeQueryKeys = ReturnType<(typeof gaugeKeys)[keyof typeof gaugeKeys]>

export type GaugeQueryKeyType<K extends keyof typeof gaugeKeys> = ReturnType<(typeof gaugeKeys)[K]>

export type AddRewardTokenParams = {
  token: string
  distributor: string
}
