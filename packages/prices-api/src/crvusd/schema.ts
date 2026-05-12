import { z } from 'zod/v4'
import type { Token } from '@primitives/address.utils'
import { fromEntries, recordEntries } from '@primitives/objects.utils'
import type { Chain } from '..'
import { address, chain, decimal, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

const token = z
  .object({
    symbol: z.string(),
    address,
    rebasing_yield: z.number().nullable().optional(),
    rebasing_yield_apr: z.number().nullable().optional(),
  })
  .transform(data => ({
    symbol: data.symbol,
    address: data.address,
    rebasingYield: data.rebasing_yield ?? null,
    rebasingYieldApr: data.rebasing_yield_apr ?? null,
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
  .transform(data => ({
    name: data.collateral_token.symbol,
    address: data.address,
    factoryAddress: data.factory_address,
    llamma: data.llamma,
    rate: data.rate,
    // borrowApy = rate * 100
    borrowApy: data.borrow_apy,
    // @deprecated compute this using borrowApy and collateralToken.rebasingYield: borrowTotalApy = borrowApy - collateral_yield_apy
    borrowTotalApy: data.borrow_total_apy,
    borrowApr: data.borrow_apr,
    // @deprecated compute this using borrowApr and collateralToken.rebasingYieldApr
    borrowTotalApr: data.borrow_total_apr,
    borrowed: data.total_debt,
    borrowedUsd: data.total_debt_usd,
    borrowable: data.borrowable,
    leverage: data.leverage,
    collateralAmount: data.collateral_amount,
    collateralAmountUsd: data.collateral_amount_usd,
    debtCeiling: data.debt_ceiling,
    loans: data.n_loans,
    collateralToken: data.collateral_token,
    stablecoinToken: data.stablecoin_token,
    fees: {
      pending: data.pending_fees,
      collected: data.collected_fees,
    },
    createdAt: parseTimestamp(data.created_at),
    maxLtv: data.max_ltv,
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
  .transform(data => ({
    timestamp: parseTimestamp(data.dt),
    rate: data.rate,
    borrowApy: data.borrow_apy, // value already in percentage: 0.12 => 0.12%
    borrowApr: data.borrow_apr, // value already in percentage: 0.12 => 0.12%
    nLoans: data.n_loans,
    minted: data.minted,
    redeemed: data.redeemed,
    totalCollateral: data.total_collateral,
    totalCollateralUsd: data.total_collateral_usd,
    totalStablecoin: data.total_stablecoin,
    totalStablecoinUsd: data.total_stablecoin_usd,
    totalDebt: data.total_debt,
    totalDebtUsd: data.total_debt_usd,
    priceAMM: data.amm_price,
    priceOracle: data.price_oracle,
    borrowable: data.borrowable,
    discountLiquidation: data.liquidation_discount,
    discountLoan: data.loan_discount,
    ammA: data.amm_a,
    basePrice: data.base_price,
    minBand: data.min_band,
    maxBand: data.max_band,
    sumDebtSquared: data.sum_debt_squared,
    collateralToken: data.collateral_token,
    stablecoinToken: data.stablecoin_token,
    maxLtv: data.max_ltv,
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
  .transform(data => ({
    address: data.address,
    pool: data.pool,
    poolAddress: data.pool_address,
    pair: data.pair.map(item => ({ symbol: item.symbol, address: item.address }) as Token),
    active: data.active,
    totalDebt: data.total_debt,
    totalProfit: data.total_profit,
  }))

const crvUsdSupply = z
  .object({
    market: z.string(),
    supply: z.number(),
    borrowable: z.number(),
    timestamp: timestampResponse,
  })
  .transform(data => ({
    timestamp: parseTimestamp(data.timestamp),
    market: data.market,
    supply: data.supply,
    borrowable: data.borrowable,
  }))

const userMarket = z
  .object({
    collateral: z.string(),
    controller: address,
    first_snapshot: timestampResponse,
    last_snapshot: timestampResponse,
  })
  .transform(data => ({
    collateral: data.collateral,
    controller: data.controller,
    snapshotFirst: parseTimestamp(data.first_snapshot),
    snapshotLast: parseTimestamp(data.last_snapshot),
  }))

const userMarketStats = z
  .object({
    health: z.number(),
    health_full: z.number(),
    n1: z.number(),
    n2: z.number(),
    n: z.number(),
    active_band: z.number(),
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
  .transform(data => ({
    health: data.health,
    healthFull: data.health_full,
    n: data.n,
    n1: data.n1,
    n2: data.n2,
    activeBand: data.active_band,
    /** The amount of borrow token borrowed by the user, so what you'd normally expect as 'borrowed' */
    debt: data.debt,
    collateral: data.collateral,
    /** The amount of collateral token converted into debt token (due to soft liq) */
    stablecoin: data.stablecoin,
    softLiquidation: data.soft_liquidation,
    totalDeposited: data.total_deposited,
    loss: data.loss,
    lossPct: data.loss_pct,
    collateralUp: data.collateral_up,
    oraclePrice: data.oracle_price,
    blockNumber: data.block_number,
    timestamp: parseTimestamp(data.timestamp),
  }))

const collateralEventType = z.enum(['Borrow', 'Liquidate', 'Repay', 'RemoveCollateral'])

const collateralEvent = z
  .object({
    dt: timestampResponse,
    transaction_hash: address,
    type: collateralEventType,
    user: address,
    collateral_change: z.number(),
    collateral_change_usd: z.number().nullable(),
    loan_change: z.number(),
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
      .nullable(),
    n1: z.number(),
    n2: z.number(),
    oracle_price: z.number(),
    is_position_closed: z.boolean(),
  })
  .transform(data => ({
    timestamp: parseTimestamp(data.dt),
    txHash: data.transaction_hash,
    type: data.type,
    user: data.user,
    collateralChange: data.collateral_change,
    collateralChangeUsd: data.collateral_change_usd ?? undefined,
    loanChange: data.loan_change,
    loanChangeUsd: data.loan_change_usd ?? undefined,
    liquidation:
      data.liquidation === null
        ? undefined
        : {
            user: data.liquidation.user,
            liquidator: data.liquidation.liquidator,
            collateralReceived: data.liquidation.collateral_received,
            collateralReceivedUsd: data.liquidation.collateral_received_usd,
            stablecoinReceived: data.liquidation.stablecoin_received,
            stablecoinReceivedUsd: data.liquidation.stablecoin_received_usd,
            debt: data.liquidation.debt,
            debtUsd: data.liquidation.debt_usd,
          },
    n1: data.n1,
    n2: data.n2,
    oraclePrice: data.oracle_price,
    isPositionClosed: data.is_position_closed,
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
  .transform(data => ({
    controller: data.controller,
    user: data.user,
    totalDeposit: data.total_deposit,
    totalDepositFromUser: data.total_deposit_from_user,
    totalBorrowed: data.total_borrowed,
    totalDepositPrecise: data.total_deposit_precise,
    totalBorrowedPrecise: data.total_borrowed_precise,
    totalDepositFromUserPrecise: data.total_deposit_from_user_precise,
    totalDepositFromUserUsdValue: data.total_deposit_from_user_usd_value,
    totalDepositUsdValue: data.total_deposit_usd_value,
    events: data.data,
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
