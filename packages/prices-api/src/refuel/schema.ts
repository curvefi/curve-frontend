import { z } from 'zod/v4'
import { chains, type Chain } from '..'
import { getPoolsResponse } from '../pools/schema'
import { address, camelizeKeys, hex, timestamp } from '../schemas'

// According to the API spec a lot of fields are nullable for whatever reason
const nullableNumber = z.number().nullable().optional()
const nullableTimestamp = timestamp.nullable().optional()
const nullableNumberArray = z.array(z.number()).nullable().optional()

const donationToken = z.object({
  symbol: z.string(),
  address,
  decimals: z.number(),
})

const donationTokenAmount = z.object({
  token: donationToken,
  amount: z.number(),
})

const timeseriesPoint = z
  .object({
    timestamp,
    block_number: z.number().nullable().optional(),
    virtual_price: nullableNumber,
    xcp_profit: nullableNumber,
    xcp_profit_a: nullableNumber,
    price_scale: nullableNumberArray,
    price_oracle: nullableNumberArray,
    last_prices: nullableNumberArray,
    reserves: nullableNumberArray,
    donation_shares: nullableNumber,
    last_donation_release_ts: nullableTimestamp,
    donation_duration: nullableNumber,
    donation_protection_expiry_ts: nullableTimestamp,
    donation_protection_period: nullableNumber,
    unlocked_shares: nullableNumber,
    available_shares: nullableNumber,
    lp_price_scale: nullableNumber,
    lp_usd_price: nullableNumber,
    tvl_usd: nullableNumber,
    xcp_profit_half: nullableNumber,
    vp_xcp_half_gap: nullableNumber,
  })
  .transform(camelizeKeys)

const ilPoint = z
  .object({
    timestamp,
    il_percent: z.number(),
    il_usd_per_lp: z.number().nullable(),
    lp_value_usd_per_lp: z.number(),
    hodl_value_usd_per_lp: z.number(),
  })
  .transform(camelizeKeys)

const donationEvent = z
  .object({
    timestamp,
    block_number: z.number(),
    donor: address.nullable().optional(),
    lp_shares_minted: nullableNumber,
    usd_value: nullableNumber,
    token_amounts: nullableNumberArray,
    transaction_hash: hex.nullable().optional(),
  })
  .transform(camelizeKeys)
  .transform(({ transactionHash, ...data }) => ({
    ...data,
    txHash: transactionHash ?? null,
  }))

const donationLeader = z
  .object({
    donor: address,
    usd_total: z.number(),
    events: z.number(),
    first_ts: timestamp.nullable().optional(),
    last_ts: timestamp.nullable().optional(),
    token_amounts_breakdown: z.array(donationTokenAmount).nullable().optional(),
  })
  .transform(camelizeKeys)

const donationDailyPoint = z
  .object({
    timestamp,
    total_usd: z.number(),
    count: z.number(),
  })
  .transform(camelizeKeys)

export const refuelTimeseriesResponse = z.object({
  count: z.number(),
  page: z.number(),
  tokens: z.array(donationToken),
  data: z.array(timeseriesPoint),
})

export const refuelIlTimeseriesResponse = z
  .object({
    baseline_ts: timestamp,
    tokens: z.array(donationToken),
    data: z.array(ilPoint),
    il_actual_end: nullableNumber,
    il_xyk_end: nullableNumber,
    il_no_donation_inflows_end: nullableNumber,
    lp_value_usd_start_per_lp: nullableNumber,
    lp_value_usd_end_per_lp: nullableNumber,
    hodl_value_usd_start_per_lp: nullableNumber,
    hodl_value_usd_end_per_lp: nullableNumber,
    pnl_lp_usd_per_lp: nullableNumber,
    pnl_hodl_usd_per_lp: nullableNumber,
    delta_vs_hodl_usd_per_lp: nullableNumber,
    pnl_lp_usd_total: nullableNumber,
    pnl_hodl_usd_total: nullableNumber,
    delta_vs_hodl_usd_total: nullableNumber,
  })
  .transform(camelizeKeys)

export const refuelDonationEventsResponse = z.object({
  count: z.number(),
  page: z.number(),
  tokens: z.array(donationToken),
  data: z.array(donationEvent),
})

export const refuelDonationLeaderboardResponse = z.array(donationLeader)

export const refuelChainsResponse = z
  .object({
    chains: z.array(z.string()),
    count: z.number(),
  })
  .transform(({ chains: chainNames }) => chainNames.filter((chain): chain is Chain => chains.includes(chain as Chain)))

export const refuelPoolsResponse = getPoolsResponse // just a reuse of the pools schema since the response is the same
export const refuelDailyDonationsResponse = z
  .object({ data: z.array(donationDailyPoint) })
  .transform(({ data }) => ({ data }))
