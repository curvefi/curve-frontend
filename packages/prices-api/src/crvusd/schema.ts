import { z } from 'zod/v4'
import { fromEntries, recordEntries } from '@primitives/objects.utils'
import type { Chain } from '..'
import { address, camelizeKeys, chain, decimal, timestamp } from '../schemas'

const token = z
  .object({
    symbol: z.string(),
    address,
    rebasing_yield: z.number().nullable().optional(),
    rebasing_yield_apr: z.number().nullable().optional(),
  })
  .transform(camelizeKeys)
  .transform(({ rebasingYield, rebasingYieldApr, ...data }) => ({
    ...data,
    rebasingYield: rebasingYield ?? null,
    rebasingYieldApr: rebasingYieldApr ?? null,
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
    created_at: timestamp,
    max_ltv: z.number(),
  })
  .transform(camelizeKeys)
  .transform(({ collateralToken, totalDebt, totalDebtUsd, nLoans, pendingFees, collectedFees, ...data }) => ({
    ...data,
    name: collateralToken.symbol,
    borrowed: totalDebt,
    borrowedUsd: totalDebtUsd,
    loans: nLoans,
    collateralToken,
    fees: {
      pending: pendingFees,
      collected: collectedFees,
    },
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
    dt: timestamp,
    liquidation_discount: z.number(),
    loan_discount: z.number(),
    sum_debt_squared: z.number(),
    collateral_token: token,
    stablecoin_token: token,
    max_ltv: z.number(),
  })
  .transform(camelizeKeys)
  .transform(({ dt, ammPrice, liquidationDiscount, loanDiscount, ...data }) => ({
    ...data,
    timestamp: dt,
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

const crvUsdSupply = z.object({
  market: z.string(),
  supply: z.number(),
  borrowable: z.number(),
  timestamp,
})

const userMarket = z
  .object({
    collateral: z.string(),
    controller: address,
    first_snapshot: timestamp,
    last_snapshot: timestamp,
  })
  .transform(camelizeKeys)
  .transform(({ firstSnapshot, lastSnapshot, ...data }) => ({
    ...data,
    snapshotFirst: firstSnapshot,
    snapshotLast: lastSnapshot,
  }))

export const getUserMarketStatsResponse = z
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
    timestamp,
  })
  .transform(camelizeKeys)

const collateralEventType = z.enum(['Borrow', 'Liquidate', 'Repay', 'RemoveCollateral'])

const collateralEvent = z
  .object({
    dt: timestamp,
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
  .transform(({ dt, transactionHash, collateralChangeUsd, loanChangeUsd, liquidation, ...data }) => ({
    ...data,
    timestamp: dt,
    txHash: transactionHash,
    collateralChangeUsd: collateralChangeUsd ?? undefined,
    loanChangeUsd: loanChangeUsd ?? undefined,
    liquidation: liquidation ?? undefined,
  }))

export const getMarketsResponse = z
  .object({
    data: z.array(market),
    count: z.number(),
  })
  .transform(({ data }) => data)

const rawGetMarketsResponse = z.object({
  data: z.array(market),
  count: z.number(),
})

export const getAllMarketsResponse = z
  .object({
    chains: z.record(z.string(), rawGetMarketsResponse),
  })
  .transform(
    ({ chains }) =>
      fromEntries(recordEntries(chains).map(([chain, item]) => [chain, item.data])) as Record<
        Chain,
        z.infer<typeof market>[]
      >,
  )

export const getSnapshotsResponse = z.object({ data: z.array(snapshot) }).transform(({ data }) => data)
export const getKeepersResponse = z.object({ keepers: z.array(keeper) }).transform(({ keepers }) => keepers)
export const getSupplyResponse = z.object({ data: z.array(crvUsdSupply) }).transform(({ data }) => data)

export const getUserMarketsResponse = z
  .object({
    user: z.string(),
    markets: z.array(userMarket),
    page: z.number(),
    per_page: z.number(),
    count: z.number(),
  })
  .transform(camelizeKeys)
  .transform(({ markets }) => markets)

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
    ({ chains }) =>
      fromEntries(recordEntries(chains).map(([chain, item]) => [chain, item.markets])) as Record<
        Chain,
        z.infer<typeof userMarket>[]
      >,
  )

export const getUserMarketSnapshotsResponse = z
  .object({
    user: z.string(),
    data: z.array(getUserMarketStatsResponse),
    page: z.number(),
    per_page: z.number(),
    count: z.number(),
  })
  .transform(camelizeKeys)
  .transform(({ data }) => data)

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
  .transform(({ chain: _chain, count: _count, data: events, page: _page, pagination: _pagination, ...data }) => ({
    ...data,
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
export type UserMarketStats = z.infer<typeof getUserMarketStatsResponse>
export type UserMarketSnapshots = z.infer<typeof getUserMarketSnapshotsResponse>
export type UserCollateralEvent = z.infer<typeof collateralEvent>
export type UserCollateralEvents = z.infer<typeof getUserCollateralEventsResponse>
export type CrvUsdTvl = z.infer<typeof getCrvUsdTvlResponse>
