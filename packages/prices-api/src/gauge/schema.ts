import { z } from 'zod/v4'
import type { Chain } from '..'
import { address, camelizeKeys, timestamp } from '../schemas'

const GAUGE_WEIGHT_SCALE = 1e18

const gauge = z
  .object({
    address,
    gauge_type: z.string(),
    name: z.string().nullable(),
    version: z.string().nullable(),
    lp_token: address.nullable(),
    pool: z
      .object({
        address,
        name: z.string(),
        chain: z.string(),
        tvl_usd: z.number(),
        trading_volume_24h: z.number(),
      })
      .nullable(),
    tokens: z
      .array(
        z.object({
          symbol: z.string(),
          address,
          precision: z.number(),
        }),
      )
      .nullable(),
    market: z
      .object({
        name: z.string(),
        chain: z.string(),
      })
      .nullable(),
    is_killed: z.boolean(),
    emissions: z.number(),
    gauge_weight: z.string(),
    gauge_weight_7d_delta: z.number().nullable(),
    gauge_weight_60d_delta: z.number().nullable(),
    gauge_relative_weight: z.number(),
    gauge_relative_weight_7d_delta: z.number().nullable(),
    gauge_relative_weight_60d_delta: z.number().nullable(),
    creation_tx: address,
    creation_date: timestamp,
    last_vote_date: timestamp.nullable(),
    last_vote_tx: address.nullable(),
  })
  .transform(camelizeKeys)
  .transform(data => ({
    address: data.address,
    type: data.gaugeType,
    name: data.name ?? undefined,
    version: data.version ?? undefined,
    lpToken: data.lpToken ?? undefined,
    pool: data.pool
      ? {
          address: data.pool.address,
          name: data.pool.name,

          chain: data.pool.chain as Chain,
          tvlUsd: data.pool.tvlUsd,
          tradingVolume24h: data.pool.tradingVolume24h,
        }
      : undefined,
    tokens: data.tokens?.map(token => ({
      symbol: token.symbol,
      address: token.address,
      precision: token.precision,
    })),
    market: data.market
      ? {
          name: data.market.name,

          chain: data.market.chain as Chain,
        }
      : undefined,
    killed: data.isKilled,
    emissions: data.emissions,
    weight: BigInt(data.gaugeWeight),
    weightDelta7d: data.gaugeWeight7dDelta ?? undefined,
    weightDelta60d: data.gaugeWeight60dDelta ?? undefined,
    weightRelative: data.gaugeRelativeWeight,
    weightRelativeDelta7d: data.gaugeRelativeWeight7dDelta ?? undefined,
    weightRelativeDelta60d: data.gaugeRelativeWeight60dDelta ?? undefined,
    creationTx: data.creationTx,
    creationDate: data.creationDate,
    lastVoteTx: data.lastVoteTx ?? undefined,
    lastVoteDate: data.lastVoteDate ?? undefined,
  }))

const gaugeVote = z
  .object({
    user: address,
    weight: z.number(),
    block_number: z.number(),
    timestamp,
    transaction: address,
  })
  .transform(camelizeKeys)
  .transform(({ transaction, ...data }) => ({ ...data, tx: transaction }))

const weightHistory = z
  .object({
    is_killed: z.boolean(),
    gauge_weight: z.string(),
    gauge_relative_weight: z.string(),
    emissions: z.string(),
    epoch: timestamp,
  })
  .transform(camelizeKeys)
  .transform(({ isKilled, gaugeWeight, gaugeRelativeWeight, emissions, epoch: timestamp }) => ({
    killed: isKilled,
    weight: parseFloat(gaugeWeight) / GAUGE_WEIGHT_SCALE,
    weightRelative: (parseFloat(gaugeRelativeWeight) / GAUGE_WEIGHT_SCALE) * 100,
    emissions: parseFloat(emissions),
    timestamp,
  }))

export const getDeploymentResponse = z
  .object({
    from_address: address,
    to_address: address.nullable(),
    calldata: z.string(),
    decoded_calldata: z.string().nullable(),
    transaction_hash: address,
    block_number: z.number(),
    dt: timestamp,
  })
  .transform(camelizeKeys)
  .transform(({ fromAddress, toAddress, decodedCalldata, dt, ...data }) => ({
    ...data,
    addressFrom: fromAddress,
    addressTo: toAddress ?? undefined,
    calldataDecoded: decodedCalldata ?? undefined,
    timestamp: dt,
  }))

const userGaugeVote = z
  .object({
    gauge: address,
    gauge_name: z.string().nullable(),
    weight: z.number(),
    block_number: z.number(),
    timestamp,
    transaction: address,
  })
  .transform(camelizeKeys)
  .transform(({ gaugeName, transaction, ...data }) => ({
    ...data,
    gaugeName: gaugeName ?? undefined,
    txHash: transaction,
  }))

export const getGaugeResponse = gauge
export const getGaugesResponse = z.object({ gauges: z.array(gauge) }).transform(({ gauges }) => gauges)
export const getVotesResponse = z.object({ votes: z.array(gaugeVote) }).transform(({ votes }) => votes)
export const getWeightHistoryResponse = z.object({ data: z.array(weightHistory) }).transform(({ data }) => data)
export const getUserGaugeVotesResponse = z.object({ votes: z.array(userGaugeVote) }).transform(({ votes }) => votes)

export type Gauge = z.infer<typeof gauge>
export type GaugeVote = z.infer<typeof gaugeVote>
export type WeightHistory = z.infer<typeof weightHistory>
export type Deployment = z.infer<typeof getDeploymentResponse>
export type UserGaugeVote = z.infer<typeof userGaugeVote>
