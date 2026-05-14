import { z } from 'zod/v4'
import { fromEntries, recordEntries } from '@primitives/objects.utils'
import type { Chain } from '..'
import { address, camelizeKeys, chain, decimal, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

const token = z
  .object({
    symbol: z.string(),
    address,
    rebasing_yield: z.number().nullable().optional(),
    rebasing_yield_apr: z.number().nullable().optional(),
  })
  .transform(camelizeKeys)
  .transform(data => ({
    symbol: data.symbol,
    address: data.address,
    rebasingYield: data.rebasingYield ?? null,
    rebasingYieldApr: data.rebasingYieldApr ?? null,
  }))

const market = z
  .object({
    address,
    factory_address: address,
    llamma: address,
    rate: z.number(),
    borrow_apy: z.number(),
    borrow_total_apy: z.number(),
    borrow_apr: z.number(),
    borrow_total_apr: z.number(),
    total_debt: z.number(),
    total_debt_usd: z.number(),
    n_loans: z.number(),
    debt_ceiling: z.number(),
    borrowable: z.number(),
    leverage: z.number(),
    pending_fees: z.number(),
    collected_fees: z.number(),
    collateral_amount: z.number(),
    collateral_amount_usd: z.number(),
    stablecoin_amount: z.number(),
    collateral_token: token,
    stablecoin_token: token,
    created_at: timestampResponse,
    max_ltv: z.number(),
  })
  .transform(camelizeKeys)
  .transform(data => ({
    name: data.collateralToken.symbol,
    address: data.address,
    factoryAddress: data.factoryAddress,
    llamma: data.llamma,
    rate: data.rate,
    // borrowApy = rate * 100
    borrowApy: data.borrowApy,
    // @deprecated compute this using borrowApy and collateralToken.rebasingYield: borrowTotalApy = borrowApy - collateral_yield_apy
    borrowTotalApy: data.borrowTotalApy,
    borrowApr: data.borrowApr,
    // @deprecated compute this using borrowApr and collateralToken.rebasingYieldApr
    borrowTotalApr: data.borrowTotalApr,
    borrowed: data.totalDebt,
    borrowedUsd: data.totalDebtUsd,
    borrowable: data.borrowable,
    leverage: data.leverage,
    collateralAmount: data.collateralAmount,
    collateralAmountUsd: data.collateralAmountUsd,
    debtCeiling: data.debtCeiling,
    loans: data.nLoans,
    collateralToken: data.collateralToken,
    stablecoinToken: data.stablecoinToken,
    fees: {
      pending: data.pendingFees,
      collected: data.collectedFees,
    },
    createdAt: parseTimestamp(data.createdAt),
    maxLtv: data.maxLtv,
  }))

const snapshot = z
  .object({
    rate: z.number(),
    borrow_apy: z.number(),
    borrow_apr: z.number(),
    minted: z.number(),
    redeemed: z.number(),
    total_collateral: z.number(),
    total_collateral_usd: z.number(),
    total_stablecoin: z.number(),
    total_stablecoin_usd: z.number(),
    total_debt: z.number(),
    total_debt_usd: z.number(),
    n_loans: z.number(),
    amm_price: z.number(),
    amm_a: z.number(),
    price_oracle: z.number(),
    base_price: z.number(),
    min_band: z.number(),
    max_band: z.number(),
    borrowable: z.number(),
    dt: timestampResponse,
    liquidation_discount: z.number(),
    loan_discount: z.number(),
    sum_debt_squared: z.number(),
    collateral_token: token,
    stablecoin_token: token,
    max_ltv: z.number(),
  })
  .transform(camelizeKeys)
  .transform(({ dt, ammPrice, liquidationDiscount, loanDiscount, ...snapshot }) => ({
    ...snapshot,
    timestamp: parseTimestamp(dt),
    priceAMM: ammPrice,
    discountLiquidation: liquidationDiscount,
    discountLoan: loanDiscount,
  }))

const keeper = z
  .object({
    address,
    pool: z.string(),
    pool_address: address,
    pair: z.array(z.object({ symbol: z.string(), address })),
    active: z.boolean(),
    total_debt: z.number(),
    total_profit: z.number(),
  })
  .transform(camelizeKeys)

const crvUsdSupply = z
  .object({
    market: z.string(),
    supply: z.number(),
    borrowable: z.number(),
    timestamp: timestampResponse,
  })
  .transform(({ timestamp, ...supply }) => ({ ...supply, timestamp: parseTimestamp(timestamp) }))

const userMarket = z
  .object({
    collateral: z.string(),
    controller: address,
    first_snapshot: timestampResponse,
    last_snapshot: timestampResponse,
  })
  .transform(camelizeKeys)
  .transform(data => ({
    collateral: data.collateral,
    controller: data.controller,
    snapshotFirst: parseTimestamp(data.firstSnapshot),
    snapshotLast: parseTimestamp(data.lastSnapshot),
  }))

const userMarketStats = z
  .object({
    health: z.number(),
    health_full: z.number(),
    n1: z.number(),
    n2: z.number(),
    n: z.number(),
    active_band: z.number().nullable(),
    debt: z.number(),
    collateral: z.number(),
    stablecoin: z.number(),
    soft_liquidation: z.boolean(),
    total_deposited: z.number(),
    loss: z.number(),
    loss_pct: z.number(),
    collateral_up: z.number(),
    oracle_price: z.number(),
    block_number: z.number(),
    timestamp: timestampResponse,
  })
  .transform(camelizeKeys)
  .transform(data => ({ ...data, timestamp: parseTimestamp(data.timestamp) }))

const collateralEventType = z.enum(['Borrow', 'Liquidate', 'Repay', 'RemoveCollateral'])

const collateralEvent = z
  .object({
    dt: timestampResponse,
    transaction_hash: address,
    type: collateralEventType,
    user: address,
    collateral_change: z.number(),
    collateral_change_usd: z.number().nullable(),
    loan_change: z
      .number()
      .nullable()
      .transform(value => value ?? 0),
    loan_change_usd: z.number().nullable(),
    liquidation: z
      .object({
        user: address,
        liquidator: address,
        collateral_received: z.number(),
        collateral_received_usd: z.number(),
        stablecoin_received: z.number(),
        stablecoin_received_usd: z.number(),
        debt: z.number(),
        debt_usd: z.number(),
      })
      .transform(camelizeKeys)
      .nullable(),
    n1: z.number(),
    n2: z.number(),
    oracle_price: z.number(),
    is_position_closed: z.boolean(),
  })
  .transform(camelizeKeys)
  .transform(data => ({
    ...data,
    timestamp: parseTimestamp(data.dt),
    txHash: data.transactionHash,
    collateralChangeUsd: data.collateralChangeUsd ?? undefined,
    loanChangeUsd: data.loanChangeUsd ?? undefined,
    liquidation: data.liquidation ?? undefined,
  }))

export const getMarketsResponse = z
  .object({
    data: z.array(market),
    count: z.number(),
  })
  .transform(data => data.data)

const rawGetMarketsResponse = z.object({
  data: z.array(market),
  count: z.number(),
})

export const getAllMarketsResponse = z
  .object({
    chains: z.record(z.string(), rawGetMarketsResponse),
  })
  .transform(
    data =>
      fromEntries(recordEntries(data.chains).map(([chain, item]) => [chain, item.data])) as Record<
        Chain,
        z.infer<typeof market>[]
      >,
  )

export const getSnapshotsResponse = z
  .object({
    data: z.array(snapshot),
  })
  .transform(data => data.data)

export const getKeepersResponse = z
  .object({
    keepers: z.array(keeper),
  })
  .transform(data => data.keepers)

export const getSupplyResponse = z
  .object({
    data: z.array(crvUsdSupply),
  })
  .transform(data => data.data)

export const getUserMarketsResponse = z
  .object({
    user: z.string(),
    markets: z.array(userMarket),
    page: z.number(),
    per_page: z.number(),
    count: z.number(),
  })
  .transform(data => data.markets)

const rawUserMarketsResponse = z.object({
  markets: z.array(userMarket),
  count: z.number(),
})

export const getAllUserMarketsResponse = z
  .object({
    user: address,
    chains: z.record(z.string(), rawUserMarketsResponse),
  })
  .transform(
    data =>
      fromEntries(recordEntries(data.chains).map(([chain, item]) => [chain, item.markets])) as Record<
        Chain,
        z.infer<typeof userMarket>[]
      >,
  )

export const getUserMarketStatsResponse = userMarketStats

export const getUserMarketSnapshotsResponse = z
  .object({
    user: z.string(),
    data: z.array(userMarketStats),
    page: z.number(),
    per_page: z.number(),
    count: z.number(),
  })
  .transform(data => data.data)

export const getUserCollateralEventsResponse = z
  .object({
    chain,
    controller: address,
    user: address,
    total_deposit: z.number(),
    total_deposit_from_user: z.number(),
    total_borrowed: z.number(),
    total_deposit_precise: decimal,
    total_borrowed_precise: decimal,
    total_deposit_from_user_precise: decimal,
    total_deposit_from_user_usd_value: z.number(),
    total_deposit_usd_value: z.number(),
    count: z.number(),
    pagination: z.number().nullable(),
    page: z.number().nullable(),
    data: z.array(collateralEvent),
  })
  .transform(camelizeKeys)
  .transform(({ chain: _chain, count: _count, data: events, page: _page, pagination: _pagination, ...summary }) => ({
    ...summary,
    events,
  }))

export const getCrvUsdTvlResponse = z.object({
  chain,
  tvl: z.number(),
})

export type Market = z.infer<typeof market>
export type Snapshot = z.infer<typeof snapshot>
export type CrvUsdSupply = z.infer<typeof crvUsdSupply>
export type Keeper = z.infer<typeof keeper>
/** More specifically, the markets where a user holds a position */
export type UserMarkets = z.infer<typeof getUserMarketsResponse>
export type UserMarketStats = z.infer<typeof userMarketStats>
export type UserMarketSnapshots = z.infer<typeof getUserMarketSnapshotsResponse>
export type UserCollateralEvent = z.infer<typeof collateralEvent>
export type UserCollateralEvents = z.infer<typeof getUserCollateralEventsResponse>
export type CrvUsdTvl = z.infer<typeof getCrvUsdTvlResponse>
