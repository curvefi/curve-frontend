import { z } from 'zod/v4'
import type { Chain } from '..'
import { address, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

const coin = z.object({
  lp_token: z.boolean(),
  symbol: z.string(),
  address,
  precision: z.number(),
})

const chainRevenue = z
  .object({
    chain: z.string(),
    totalDailyFeesUSD: z.number(),
  })
  .transform(data => ({
    chain: data.chain,
    totalDailyFeesUSD: data.totalDailyFeesUSD,
  }))

const currentChainRevenue = z
  .object({
    chain: z.string(),
    total_fees: z.number(),
  })
  .transform(data => ({
    chain: data.chain,
    totalDailyFeesUSD: data.total_fees,
  }))

const chainTopPoolRevenue = z
  .object({
    name: z.string(),
    totalDailyFeesUSD: z.number(),
  })
  .transform(data => ({
    name: data.name,
    totalDailyFeesUSD: data.totalDailyFeesUSD,
  }))

const currentChainTopPoolRevenue = z
  .object({
    name: z.string(),
    trading_fee_24h: z.number(),
    liquidity_fee_24h: z.number(),
  })
  .transform(data => ({
    name: data.name,
    totalDailyFeesUSD: data.trading_fee_24h + data.liquidity_fee_24h,
  }))

const crvUsdWeekly = z
  .object({
    controller: address,
    collateral: z.string(),
    fees_usd: z.number(),
    timestamp: timestampResponse,
  })
  .transform(data => ({
    timestamp: parseTimestamp(data.timestamp),
    controller: data.controller,
    collateral: data.collateral,
    feesUsd: data.fees_usd,
  }))

const poolsWeekly = z
  .object({
    chain: z.string(),
    fees_usd: z.number(),
    timestamp: timestampResponse,
  })
  .transform(data => ({
    timestamp: parseTimestamp(data.timestamp),
    chain: data.chain as Chain,
    feesUsd: data.fees_usd,
  }))

const cushion = z
  .object({
    pool: address,
    name: z.string(),
    admin_fees: z.array(z.number()),
    usd_value: z.number(),
  })
  .transform(data => ({
    pool: data.pool,
    name: data.name,
    adminFees: data.admin_fees,
    usdValue: data.usd_value,
  }))

const distribution = z
  .object({
    timestamp: timestampResponse,
    fees_usd: z.number(),
  })
  .transform(data => ({ timestamp: parseTimestamp(data.timestamp), feesUsd: data.fees_usd }))

const cowSwapSettlement = z
  .object({
    coin,
    amount: z.string(),
    fee_amount: z.string(),
    amount_received: z.number(),
    router_received: z.number(),
    epoch: z.number(),
    tx_hash: address,
    block_number: z.number(),
    dt: timestampResponse,
  })
  .transform(data => ({
    timestamp: parseTimestamp(data.dt),
    coin: {
      lpToken: data.coin.lp_token,
      symbol: data.coin.symbol,
      address: data.coin.address,
      precision: data.coin.precision,
    },
    amount: BigInt(data.amount),
    amountFee: BigInt(data.fee_amount),
    amountReceived: data.amount_received,
    routerReceived: data.router_received,
    epoch: data.epoch,
    txHash: data.tx_hash,
    blockNumber: data.block_number,
  }))

const fees = z
  .object({
    coin,
    amount: z.string(),
    usd_amount: z.string(),
  })
  .transform(data => ({
    coin: {
      lpToken: data.coin.lp_token,
      symbol: data.coin.symbol,
      address: data.coin.address,
      decimals: data.coin.precision,
    },
    amount: parseFloat(data.amount),
    amountUsd: parseFloat(data.usd_amount),
  }))

const legacyGetByChainResponse = z
  .object({
    revenue: z.array(chainRevenue),
  })
  .transform(data => data.revenue)

const currentGetByChainResponse = z
  .object({
    chains: z.array(currentChainRevenue),
  })
  .transform(data => data.chains)

export const getByChainResponse = z.union([legacyGetByChainResponse, currentGetByChainResponse])

const legacyGetTopPoolsResponse = z
  .object({
    revenue: z.array(chainTopPoolRevenue),
  })
  .transform(data => data.revenue)

const currentGetTopPoolsResponse = z
  .object({
    data: z.array(currentChainTopPoolRevenue),
  })
  .transform(data => data.data.sort((a, b) => b.totalDailyFeesUSD - a.totalDailyFeesUSD))

export const getTopPoolsResponse = z.union([legacyGetTopPoolsResponse, currentGetTopPoolsResponse])

export const getCrvUsdWeeklyResponse = z
  .object({
    fees: z.array(crvUsdWeekly),
  })
  .transform(data => data.fees)

export const getPoolsWeeklyResponse = z
  .object({
    fees: z.array(poolsWeekly),
  })
  .transform(data => data.fees)

export const getCushionsResponse = z
  .object({
    data: z.array(cushion),
  })
  .transform(data => data.data)

export const getDistributionsResponse = z
  .object({
    distributions: z.array(distribution),
  })
  .transform(data => data.distributions)

export const getCowSwapSettlementsResponse = z
  .object({
    data: z.array(cowSwapSettlement),
  })
  .transform(data => data.data)

export const getFeesCollectedResponse = z
  .object({
    data: z.array(fees),
  })
  .transform(data => data.data)

export const getFeesStagedResponse = z
  .object({
    data: z.array(fees),
  })
  .transform(data => data.data)

export type ChainRevenue = z.infer<typeof chainRevenue>
export type ChainTopPoolRevenue = z.infer<typeof chainTopPoolRevenue>
export type CrvUsdWeekly = z.infer<typeof crvUsdWeekly>
export type PoolsWeekly = z.infer<typeof poolsWeekly>
export type Cushion = z.infer<typeof cushion>
export type Distribution = z.infer<typeof distribution>
export type CowSwapSettlement = z.infer<typeof cowSwapSettlement>
export type FeesCollected = z.infer<typeof fees>
export type FeesStaged = z.infer<typeof fees>
