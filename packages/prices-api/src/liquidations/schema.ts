import { z } from 'zod/v4'
import { address, camelizeKeys, chain, timestamp } from '../schemas'

export const endpoint = z.enum(['crvusd', 'lending'])
export type Endpoint = z.infer<typeof endpoint>

const softLiqRatio = z
  .object({
    timestamp,
    proportion: z.number(),
  })
  .transform(data => ({
    timestamp: data.timestamp,
    proportion: data.proportion / 100,
  }))

const liquidationDetails = z
  .object({
    user: address,
    liquidator: address,
    self: z.boolean(),
    collateral_received: z.number(),
    collateral_received_usd: z.number(),
    stablecoin_received: z.number(),
    oracle_price: z.number(),
    debt: z.number(),
    n1: z.number(),
    n2: z.number(),
    dt: timestamp,
    tx: address,
    block: z.number(),
  })
  .transform(camelizeKeys)
  .transform(({ dt, oraclePrice, ...details }) => ({
    ...details,
    timestamp: dt,
    priceOracle: oraclePrice,
  }))

const liquidationAggregate = z
  .object({
    timestamp,
    self_count: z.number(),
    hard_count: z.number(),
    self_value: z.number(),
    hard_value: z.number(),
    price: z.number(),
  })
  .transform(camelizeKeys)

export const getLiqOverviewResponse = z
  .object({
    soft_liquidation_users: z.number(),
    median_health: z.number(),
    average_health: z.number(),
    collat_ratio: z.number(),
    liquidatable_positions: z.number(),
    liquidatable_pos_debt: z.string(),
    liquidatable_borrowed: z.string().optional(),
    liquidatable_stablecoin: z.string().optional(),
    liquidatable_collateral: z.string(),
    liquidatable_pos_debt_usd: z.number(),
    liquidatable_collateral_usd: z.number(),
    liquidatable_borrowed_usd: z.number().optional(),
    liquidatable_stablecoin_usd: z.number().optional(),
  })
  .transform(camelizeKeys)
  .transform(data => ({
    softLiqUsers: data.softLiquidationUsers,
    liqablePositions: data.liquidatablePositions,
    liqableDebtUsd: data.liquidatablePosDebtUsd,
    liqableCollatUsd: data.liquidatableCollateralUsd,
    liqableBorrowedUsd: data.liquidatableBorrowedUsd ?? data.liquidatableStablecoinUsd ?? 0,
    medianHealth: data.medianHealth,
    avgHealth: data.averageHealth,
    collatRatio: data.collatRatio,
  }))

const liqLosses = z
  .object({
    timestamp,
    median_pct_loss: z.number(),
    avg_pct_loss: z.number(),
    median_abs_loss: z.number(),
    avg_abs_loss: z.number(),
    total_users: z.number(),
    users_with_losses: z.number(),
    ratio: z.number(),
  })
  .transform(camelizeKeys)
  .transform(data => ({
    timestamp: data.timestamp,
    pctLossAverage: data.avgPctLoss,
    pctLossMedian: data.medianPctLoss,
    absoluteLossAverage: data.avgAbsLoss,
    absoluteLossMedian: data.medianAbsLoss,
    numTotalUsers: data.totalUsers,
    numUsersWithLosses: data.usersWithLosses,
    ratio: data.ratio,
  }))

const liqHealthDecile = z
  .object({
    health_decile: z.string(),
    collateral: z.number(),
    borrowed: z.number().optional(),
    /** crvusd endpoint returns "stablecoin" instead of "borrowed" */
    stablecoin: z.number().optional(),
    debt: z.number(),
  })
  .transform(camelizeKeys)
  .transform(data => ({
    healthDecile: data.healthDecile,
    collateral: data.collateral,
    debt: data.debt,
    borrowed: data.stablecoin ?? data.borrowed ?? 0,
  }))

const totalOverview = z
  .object({
    chain,
    soft_liquidation_users: z.number(),
    bad_debt: z.number(),
    liquidatable_positions: z.number(),
    liquidatable_pos_debt_usd: z.number(),
    liquidatable_collateral_usd: z.number(),
    // only for lending endpoint
    liquidatable_borrowed_usd: z.number().optional(),
    // only for crvusd endpoint
    liquidatable_stablecoin_usd: z.number().optional(),
  })
  .transform(camelizeKeys)
  .transform(({ liquidatableBorrowedUsd, liquidatableStablecoinUsd, ...overview }) => ({
    ...overview,
    liquidatableBorrowedUsd: liquidatableBorrowedUsd ?? null,
    liquidatableStablecoinUsd: liquidatableStablecoinUsd ?? null,
  }))

const badDebtRaw = z
  .object({
    chain,
    soft_liquidation_users: z.number(),
    bad_debt: z.number(),
    liquidatable_positions: z.number(),
    liquidatable_pos_debt_usd: z.number(),
    liquidatable_collateral_usd: z.number(),
    liquidatable_borrowed_usd: z.number().optional(),
    liquidatable_stablecoin_usd: z.number().optional(),
    market: z.string(),
    controller_address: address,
  })
  .transform(camelizeKeys)
  .transform(data => ({
    ...data,
    liquidatableBorrowedUsd: data.liquidatableBorrowedUsd ?? null,
    liquidatableStablecoinUsd: data.liquidatableStablecoinUsd ?? null,
  }))

export const getSoftLiqRatiosResponse = z
  .object({
    data: z.array(softLiqRatio),
  })
  .transform(data => data.data)

export const getLiqsDetailedResponse = z
  .object({
    data: z.array(liquidationDetails),
  })
  .transform(data => data.data)

export const getLiqsAggregateResponse = z
  .object({
    data: z.array(liquidationAggregate),
  })
  .transform(data => data.data)

export const getLiqLossesResponse = z
  .object({
    data: z.array(liqLosses),
  })
  .transform(data => data.data)

export const getLiqHealthDecilesResponse = z
  .object({
    median: z.number(),
    mean: z.number(),
    std: z.number().nullable(),
    min: z.number(),
    max: z.number(),
    data: z.array(liqHealthDecile),
  })
  .transform(data => ({
    meanHealth: data.mean,
    medianHealth: data.median,
    stdHealth: data.std ?? 0,
    minHealth: data.min,
    maxHealth: data.max,
    deciles: data.data,
  }))

export const getTotalOverviewResponse = z
  .object({
    data: z.array(totalOverview),
  })
  .transform(data => data.data)

export const getBadDebtResponse = z
  .object({
    data: z.array(badDebtRaw),
  })
  .transform(data => data.data)

export type SoftLiqRatio = z.infer<typeof softLiqRatio>
export type LiquidationDetails = z.infer<typeof liquidationDetails>
export type LiquidationAggregate = z.infer<typeof liquidationAggregate>
export type LiqOverview = z.infer<typeof getLiqOverviewResponse>
export type LiqLosses = z.infer<typeof liqLosses>
export type LiqHealthDecile = z.infer<typeof liqHealthDecile>
export type LiqHealthDeciles = z.infer<typeof getLiqHealthDecilesResponse>
export type TotalOverview = z.infer<typeof getTotalOverviewResponse>
export type BadDebt = z.infer<typeof getBadDebtResponse>
