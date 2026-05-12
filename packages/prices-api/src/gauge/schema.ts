import { z } from 'zod/v4'
import type { Chain } from '..'
import { address, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

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
    creation_date: timestampResponse,
    last_vote_date: timestampResponse.nullable(),
    last_vote_tx: address.nullable(),
  })
  .transform(data => ({
    address: data.address,
    type: data.gauge_type,
    name: data.name ?? undefined,
    version: data.version ?? undefined,
    lpToken: data.lp_token ? data.lp_token : undefined,
    pool: data.pool
      ? {
          address: data.pool.address,
          name: data.pool.name,
          chain: data.pool.chain as Chain,
          tvlUsd: data.pool.tvl_usd,
          tradingVolume24h: data.pool.trading_volume_24h,
        }
      : undefined,
    tokens: (data.tokens ?? []).map(token => ({
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
    killed: data.is_killed,
    emissions: data.emissions,
    weight: BigInt(data.gauge_weight),
    weightDelta7d: data.gauge_weight_7d_delta ? data.gauge_weight_7d_delta : undefined,
    weightDelta60d: data.gauge_weight_60d_delta ? data.gauge_weight_60d_delta : undefined,
    weightRelative: data.gauge_relative_weight,
    weightRelativeDelta7d: data.gauge_relative_weight_7d_delta ? data.gauge_relative_weight_7d_delta : undefined,
    weightRelativeDelta60d: data.gauge_relative_weight_60d_delta ? data.gauge_relative_weight_60d_delta : undefined,
    creationTx: data.creation_tx,
    creationDate: parseTimestamp(data.creation_date),
    lastVoteTx: data.last_vote_tx ?? undefined,
    lastVoteDate: data.last_vote_date ? parseTimestamp(data.last_vote_date) : undefined,
  }))

const gaugeVote = z
  .object({
    user: address,
    weight: z.number(),
    block_number: z.number(),
    timestamp: timestampResponse,
    transaction: address,
  })
  .transform(data => ({
    user: data.user,
    weight: data.weight,
    blockNumber: data.block_number,
    timestamp: parseTimestamp(data.timestamp),
    tx: data.transaction,
  }))

const weightHistory = z
  .object({
    is_killed: z.boolean(),
    gauge_weight: z.string(),
    gauge_relative_weight: z.string(),
    emissions: z.string(),
    epoch: z.number(),
  })
  .transform(data => ({
    killed: data.is_killed,
    weight: parseFloat(data.gauge_weight),
    weightRelative: parseFloat(data.gauge_relative_weight),
    emissions: parseFloat(data.emissions),
    epoch: data.epoch,
  }))

export const getDeploymentResponse = z
  .object({
    from_address: address,
    to_address: address.nullable(),
    calldata: z.string(),
    decoded_calldata: z.string().nullable(),
    transaction_hash: address,
    block_number: z.number(),
    dt: timestampResponse,
  })
  .transform(data => ({
    addressFrom: data.from_address,
    addressTo: data.to_address ?? undefined,
    calldata: data.calldata,
    calldataDecoded: data.decoded_calldata ?? undefined,
    blockNumber: data.block_number,
    timestamp: parseTimestamp(data.dt),
  }))

const userGaugeVote = z
  .object({
    gauge: address,
    gauge_name: z.string().nullable(),
    weight: z.number(),
    block_number: z.number(),
    timestamp: timestampResponse,
    transaction: address,
  })
  .transform(data => ({
    gauge: data.gauge,
    gaugeName: data.gauge_name ?? undefined,
    weight: data.weight,
    blockNumber: data.block_number,
    timestamp: parseTimestamp(data.timestamp),
    txHash: data.transaction,
  }))

export const getGaugeResponse = gauge

export const getGaugesResponse = z
  .object({
    gauges: z.array(gauge),
  })
  .transform(data => data.gauges)

export const getVotesResponse = z
  .object({
    votes: z.array(gaugeVote),
  })
  .transform(data => data.votes)

export const getWeightHistoryResponse = z
  .object({
    data: z.array(weightHistory),
  })
  .transform(data => data.data)

export const getUserGaugeVotesResponse = z
  .object({
    votes: z.array(userGaugeVote),
  })
  .transform(data => data.votes)

export type Gauge = z.infer<typeof gauge>
export type GaugeVote = z.infer<typeof gaugeVote>
export type WeightHistory = z.infer<typeof weightHistory>
export type Deployment = z.infer<typeof getDeploymentResponse>
export type UserGaugeVote = z.infer<typeof userGaugeVote>
