import { z } from 'zod/v4'
import type { Chain } from '..'
import { address, camelizeKeys, timestamp } from '../schemas'

const coin = z
  .object({
    lp_token: z.boolean(),
    symbol: z.string(),
    address,
    precision: z.number(),
  })
  .transform(camelizeKeys)

const chainRevenue = z.object({
  chain: z.string(),
  totalDailyFeesUSD: z.number(),
})

const currentChainRevenue = z
  .object({
    chain: z.string(),
    total_fees: z.number(),
  })
  .transform(camelizeKeys)
  .transform(({ chain, totalFees }) => ({
    chain,
    totalDailyFeesUSD: totalFees,
  }))

const chainTopPoolRevenue = z.object({
  name: z.string(),
  totalDailyFeesUSD: z.number(),
})

const currentChainTopPoolRevenue = z
  .object({
    name: z.string(),
    trading_fee_24h: z.number(),
    liquidity_fee_24h: z.number(),
  })
  .transform(camelizeKeys)
  .transform(({ name, tradingFee24h, liquidityFee24h }) => ({
    name,
    totalDailyFeesUSD: tradingFee24h + liquidityFee24h,
  }))

const crvUsdWeekly = z
  .object({
    controller: address,
    collateral: z.string(),
    fees_usd: z.number(),
    timestamp,
  })
  .transform(camelizeKeys)

const poolsWeekly = z
  .object({
    chain: z.string(),
    fees_usd: z.number(),
    timestamp,
  })
  .transform(camelizeKeys)
  .transform(({ timestamp, ...fees }) => ({
    ...fees,
    chain: fees.chain as Chain,
    timestamp,
  }))

const cushion = z
  .object({
    pool: address,
    name: z.string(),
    admin_fees: z.array(z.number()),
    usd_value: z.number(),
  })
  .transform(camelizeKeys)

const distribution = z
  .object({
    timestamp,
    fees_usd: z.number(),
  })
  .transform(camelizeKeys)

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
    dt: timestamp,
  })
  .transform(camelizeKeys)
  .transform(({ dt, amount, feeAmount, ...data }) => ({
    ...data,
    timestamp: dt,
    amount: BigInt(amount),
    amountFee: BigInt(feeAmount),
  }))

const fees = z
  .object({
    coin,
    amount: z.string(),
    usd_amount: z.string(),
  })
  .transform(camelizeKeys)
  .transform(({ coin, amount, usdAmount }) => ({
    coin: {
      lpToken: coin.lpToken,
      symbol: coin.symbol,
      address: coin.address,
      decimals: coin.precision,
    },
    amount: parseFloat(amount),
    amountUsd: parseFloat(usdAmount),
  }))

const legacyGetByChainResponse = z.object({ revenue: z.array(chainRevenue) }).transform(({ revenue }) => revenue)
const currentGetByChainResponse = z.object({ chains: z.array(currentChainRevenue) }).transform(({ chains }) => chains)
export const getByChainResponse = z.union([legacyGetByChainResponse, currentGetByChainResponse])

const legacyGetTopPoolsResponse = z
  .object({ revenue: z.array(chainTopPoolRevenue) })
  .transform(({ revenue }) => revenue)

const currentGetTopPoolsResponse = z
  .object({ data: z.array(currentChainTopPoolRevenue) })
  .transform(({ data }) => data.sort((a, b) => b.totalDailyFeesUSD - a.totalDailyFeesUSD))

export const getTopPoolsResponse = z.union([legacyGetTopPoolsResponse, currentGetTopPoolsResponse])

export const getCrvUsdWeeklyResponse = z.object({ fees: z.array(crvUsdWeekly) }).transform(({ fees }) => fees)
export const getPoolsWeeklyResponse = z.object({ fees: z.array(poolsWeekly) }).transform(({ fees }) => fees)
export const getCushionsResponse = z.object({ data: z.array(cushion) }).transform(({ data }) => data)

export const getDistributionsResponse = z
  .object({ distributions: z.array(distribution) })
  .transform(({ distributions }) => distributions)

export const getCowSwapSettlementsResponse = z
  .object({ data: z.array(cowSwapSettlement) })
  .transform(({ data }) => data)

export const getFeesCollectedResponse = z.object({ data: z.array(fees) }).transform(({ data }) => data)
export const getFeesStagedResponse = z.object({ data: z.array(fees) }).transform(({ data }) => data)

export type ChainRevenue = z.infer<typeof chainRevenue>
export type ChainTopPoolRevenue = z.infer<typeof chainTopPoolRevenue>
export type CrvUsdWeekly = z.infer<typeof crvUsdWeekly>
export type PoolsWeekly = z.infer<typeof poolsWeekly>
export type Cushion = z.infer<typeof cushion>
export type Distribution = z.infer<typeof distribution>
export type CowSwapSettlement = z.infer<typeof cowSwapSettlement>
export type FeesCollected = z.infer<typeof fees>
export type FeesStaged = z.infer<typeof fees>
