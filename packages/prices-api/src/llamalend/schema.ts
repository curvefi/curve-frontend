import { z } from 'zod/v4'
import { fromEntries, recordEntries } from '@primitives/objects.utils'
import type { Chain } from '..'
import { address, camelizeKeys, chain, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

export const marketVersion = z.enum(['v1', 'v2'])
export type MarketVersion = z.infer<typeof marketVersion>

const parseMarketVersion = (version: number): MarketVersion => {
  switch (version) {
    case 1:
      return 'v1'
    case 2:
      return 'v2'
    default:
      throw new Error(`Unsupported LlamaLend market version: ${version}`)
  }
}

const token = z
  .object({
    symbol: z.string(),
    address,
    rebasing_yield: z.number().nullable(),
    rebasing_yield_apr: z.number().nullable(),
  })
  .transform(camelizeKeys)

const extraRewardApr = z
  .object({
    address,
    symbol: z.string(),
    apr: z.number(),
  })
  .transform(data => ({ address: data.address, symbol: data.symbol, rate: data.apr }))

const numberLike = z.union([z.number(), z.string()]).transform(value => Number(value))

/*
 * Note that collateral can be two tokens due to soft-liquidations.
 * You can have a crvUSD borrow (partially) being collateralized by crvUSD.
 */
const market = z
  .object({
    name: z.string(),
    version: z.number(),
    controller: address,
    vault: address,
    llamma: address,
    policy: address,
    oracle: address,
    oracle_pools: z.array(address),
    rate: z.number(),
    borrow_apy: z.number(),
    borrow_total_apy: z.number(),
    borrow_apr: z.number(),
    borrow_total_apr: z.number(),
    lend_apy: z.number(),
    lend_apr: z.number(),
    lend_apr_crv_0_boost: z.number(),
    lend_apr_crv_max_boost: z.number(),
    n_loans: z.number(),
    price_oracle: z.number(),
    amm_price: z.number(),
    base_price: z.number(),
    total_debt: z.number(),
    total_assets: z.number(),
    total_debt_usd: z.number(),
    total_assets_usd: z.number(),
    minted: z.number(),
    redeemed: z.number(),
    minted_usd: z.number(),
    redeemed_usd: z.number(),
    loan_discount: z.number(),
    liquidation_discount: z.number(),
    min_band: z.number(),
    max_band: z.number(),
    collateral_balance: z.number(),
    borrowed_balance: z.number(),
    collateral_balance_usd: z.number(),
    borrowed_balance_usd: z.number(),
    collateral_token: token,
    borrowed_token: token,
    leverage: z.number(),
    extra_reward_apr: z.array(extraRewardApr),
    created_at: timestampResponse,
    max_ltv: z.number(),
  })
  .transform(camelizeKeys)
  .transform(data => {
    const { version, lendApy, lendApr, lendAprCrv0Boost, lendAprCrvMaxBoost, createdAt, ...market } = data

    return {
      ...market,
      version: parseMarketVersion(version),
      apyLend: lendApy,
      aprLend: lendApr,
      aprLendCrv0Boost: lendAprCrv0Boost,
      aprLendCrvMaxBoost: lendAprCrvMaxBoost,
      createdAt: parseTimestamp(createdAt),
    }
  })

const snapshot = z
  .object({
    rate: numberLike,
    borrow_apy: z.number(),
    borrow_apr: z.number(),
    borrow_total_apy: z.number(),
    borrow_total_apr: z.number(),
    lend_apy: z.number(),
    lend_apr: z.number(),
    lend_apr_crv_0_boost: z.number(),
    lend_apr_crv_max_boost: z.number(),
    liquidation_discount: z.number(),
    loan_discount: z.number(),
    n_loans: z.number(),
    price_oracle: numberLike,
    amm_price: numberLike,
    base_price: numberLike,
    total_debt: numberLike,
    total_debt_usd: numberLike,
    total_assets: numberLike,
    total_assets_usd: numberLike,
    minted: numberLike,
    redeemed: numberLike,
    minted_usd: numberLike,
    redeemed_usd: numberLike,
    min_band: numberLike,
    max_band: numberLike,
    collateral_balance: numberLike,
    collateral_balance_usd: numberLike,
    borrowed_balance: numberLike,
    borrowed_balance_usd: numberLike,
    amm_a: numberLike,
    sum_debt_squared: numberLike,
    extra_rewards_apr: z.array(extraRewardApr),
    collateral_token: token,
    borrowed_token: token,
    timestamp: timestampResponse,
    max_ltv: z.number(),
  })
  .transform(camelizeKeys)
  .transform(data => {
    const {
      borrowTotalApy: _borrowTotalApy,
      borrowTotalApr: _borrowTotalApr,
      extraRewardsApr,
      lendApy,
      lendApr,
      lendAprCrv0Boost,
      lendAprCrvMaxBoost,
      liquidationDiscount,
      loanDiscount,
      nLoans,
      timestamp,
      ...snapshot
    } = data

    return {
      ...snapshot,
      lendApy: lendApy / 100,
      lendApr: lendApr / 100,
      lendAprCrv0Boost: lendAprCrv0Boost / 100,
      lendAprCrvMaxBoost: lendAprCrvMaxBoost / 100,
      numLoans: nLoans,
      timestamp: parseTimestamp(timestamp),
      discountLiquidation: liquidationDiscount,
      discountLoan: loanDiscount,
      extraRewardApr: extraRewardsApr,
    }
  })

const userMarket = z
  .object({
    market_name: z.string(),
    controller: address,
    first_snapshot: timestampResponse,
    last_snapshot: timestampResponse,
  })
  .transform(camelizeKeys)
  .transform(data => ({
    name: data.marketName,
    controller: data.controller,
    snapshotFirst: parseTimestamp(data.firstSnapshot),
    snapshotLast: parseTimestamp(data.lastSnapshot),
  }))

const userLendingPosition = z
  .object({
    market_name: z.string(),
    vault_address: address,
    first_deposit: timestampResponse,
    last_activity: timestampResponse,
    current_shares: z.string(),
    current_shares_in_gauge: z.string(),
    boost_multiplier: z.number().nullable(),
  })
  .transform(camelizeKeys)
  .transform(data => ({
    marketName: data.marketName,
    vaultAddress: data.vaultAddress,
    firstDeposit: parseTimestamp(data.firstDeposit),
    lastActivity: parseTimestamp(data.lastActivity),
    currentShares: parseFloat(data.currentShares),
    currentSharesInGauge: parseFloat(data.currentSharesInGauge),
    boostMultiplier: data.boostMultiplier,
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
    borrowed: z.number(),
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
  .transform(data => {
    const { timestamp, ...stats } = data
    return { ...stats, timestamp: parseTimestamp(timestamp) }
  })

const userMarketEarnings = z
  .object({
    user: address,
    earnings: z.string(),
    deposited: z.string(),
    withdrawn: z.string(),
    transfers_in_shares: z.string(),
    transfers_out_shares: z.string(),
    transfers_in_assets: z.string(),
    transfers_out_assets: z.string(),
    transfers_shares_to_gauge: z.string(),
    transfers_shares_from_gauge: z.string(),
    transfers_assets_to_gauge: z.string(),
    transfers_assets_from_gauge: z.string(),
    transfers_shares_to_convex: z.string(),
    transfers_shares_from_convex: z.string(),
    transfers_assets_to_convex: z.string(),
    transfers_assets_from_convex: z.string(),
    current_shares: z.string(),
    current_shares_in_gauge: z.string(),
    current_shares_in_convex: z.string(),
    current_assets: z.string(),
    current_assets_in_gauge: z.string(),
    current_assets_in_convex: z.string(),
    total_current_shares: z.string(),
    total_current_assets: z.string(),
    boost_multiplier: z.number().nullable(),
  })
  .transform(camelizeKeys)
  .transform(data => ({
    user: data.user,
    earnings: parseFloat(data.earnings),
    deposited: parseFloat(data.deposited),
    withdrawn: parseFloat(data.withdrawn),
    transfersInShares: parseFloat(data.transfersInShares),
    transfersOutAssets: parseFloat(data.transfersOutAssets),
    transfersInAssets: parseFloat(data.transfersInAssets),
    transfersOutShares: parseFloat(data.transfersOutShares),
    transfersSharesToGauge: parseFloat(data.transfersSharesToGauge),
    transfersSharesFromGauge: parseFloat(data.transfersSharesFromGauge),
    transfersAssetsToGauge: parseFloat(data.transfersAssetsToGauge),
    transfersAssetsFromGauge: parseFloat(data.transfersAssetsFromGauge),
    transfersSharesToConvex: parseFloat(data.transfersSharesToConvex),
    transfersSharesFromConvex: parseFloat(data.transfersSharesFromConvex),
    transfersAssetsToConvex: parseFloat(data.transfersAssetsToConvex),
    transfersAssetsFromConvex: parseFloat(data.transfersAssetsFromConvex),
    currentShares: parseFloat(data.currentShares),
    currentSharesInGauge: parseFloat(data.currentSharesInGauge),
    currentSharesInConvex: parseFloat(data.currentSharesInConvex),
    currentAssets: parseFloat(data.currentAssets),
    currentAssetsInGauge: parseFloat(data.currentAssetsInGauge),
    currentAssetsInConvex: parseFloat(data.currentAssetsInConvex),
    totalCurrentShares: parseFloat(data.totalCurrentShares),
    totalCurrentAssets: parseFloat(data.totalCurrentAssets),
    boostMultiplier: data.boostMultiplier,
  }))

const marketUser = z
  .object({
    user: z.string(),
    first: timestampResponse,
    last: timestampResponse,
    debt: z.string(),
    health: z.string(),
    health_full: z.string(),
    loss: z.string(),
    borrowed: z.string().optional(),
    /** crvusd endpoint returns "stablecoin" instead of "borrowed" */
    stablecoin: z.string().optional(),
    /** crvusd endpoint omits collateral */
    collateral: z.string().optional(),
    soft_liquidation: z.boolean(),
  })
  .transform(camelizeKeys)
  .transform(data => ({
    user: data.user,
    first: parseTimestamp(data.first),
    last: parseTimestamp(data.last),
    debt: parseFloat(data.debt),
    health: parseFloat(data.health),
    healthFull: parseFloat(data.healthFull),
    loss: parseFloat(data.loss),
    borrowed: parseFloat(data.borrowed ?? data.stablecoin ?? '0'),
    collateral: parseFloat(data.collateral ?? '0'),
    softLiquidation: data.softLiquidation,
  }))

const collateralEvent = z
  .object({
    dt: timestampResponse,
    transaction_hash: address,
    type: z.enum(['Borrow', 'Deposit', 'Liquidate', 'Repay', 'RemoveCollateral']),
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
        stablecoin_received: z.number(),
        collateral_received_usd: z.number(),
        stablecoin_received_usd: z.number(),
        debt: z.number(),
        debt_usd: z.number(),
      })
      .transform(camelizeKeys)
      .nullable(),
    leverage: z
      .object({
        event_type: z.string(),
        user: address,
        user_borrowed: z.number(),
        user_collateral: z.number(),
        user_collateral_from_borrowed: z.number().nullable(),
        user_collateral_used: z.number().nullable(),
        debt: z.number().nullable(),
        leverage_collateral: z.number().nullable(),
        state_collateral_used: z.number().nullable(),
        borrowed_from_state_collateral: z.number().nullable(),
        borrowed_from_user_collateral: z.number().nullable(),
      })
      .transform(camelizeKeys)
      .nullable(),
    n1: z.number(),
    n2: z.number(),
    oracle_price: z.number(),
  })
  .transform(camelizeKeys)
  .transform(data => {
    const { dt, transactionHash, collateralChangeUsd, loanChangeUsd, liquidation, leverage, ...event } = data
    const { eventType, ...leverageEvent } = leverage ?? {}

    return {
      ...event,
      timestamp: parseTimestamp(dt),
      txHash: transactionHash,
      collateralChangeUsd: collateralChangeUsd ?? undefined,
      loanChangeUsd: loanChangeUsd ?? undefined,
      liquidation: liquidation ?? undefined,
      leverage: leverage ? { ...leverageEvent, type: eventType } : undefined,
    }
  })

export const getChainsResponse = z.object({ data: z.array(chain) }).transform(data => data.data)

const rawGetMarketsResponse = z.object({
  count: z.number(),
  data: z.array(market),
})

export const getMarketsResponse = rawGetMarketsResponse.transform(data => data.data)

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

const rawUserMarketsResponse = z.object({
  markets: z.array(userMarket),
  count: z.number(),
})

export const getUserMarketsResponse = z
  .object({
    user: address,
    markets: z.array(userMarket),
    page: z.number(),
    per_page: z.number(),
    count: z.number(),
  })
  .transform(data => data.markets)

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

const rawUserLendingPositionsResponse = z.object({
  markets: z.array(userLendingPosition),
  count: z.number(),
})

export const getUserLendingPositionsResponse = z
  .object({
    user: address,
    markets: z.array(userLendingPosition),
    page: z.number(),
    per_page: z.number(),
    count: z.number(),
  })
  .transform(data => data.markets)

export const getAllUserLendingPositionsResponse = z
  .object({
    user: address,
    chains: z.record(z.string(), rawUserLendingPositionsResponse),
  })
  .transform(
    data =>
      fromEntries(recordEntries(data.chains).map(([chain, item]) => [chain, item.markets])) as Record<
        Chain,
        z.infer<typeof userLendingPosition>[]
      >,
  )

export const getUserMarketStatsResponse = userMarketStats
export const getUserMarketEarningsResponse = userMarketEarnings

export const getUserMarketSnapshotsResponse = z
  .object({
    user: address,
    data: z.array(userMarketStats),
    page: z.number(),
    per_page: z.number(),
    count: z.number(),
  })
  .transform(data => data.data)

export const getMarketUsersResponse = z
  .object({
    data: z.array(marketUser),
    page: z.number(),
    per_page: z.number(),
    count: z.number(),
  })
  .transform(data => ({
    count: data.count,
    users: data.data,
  }))

export const getUserCollateralEventsResponse = z
  .object({
    chain: z.string(),
    controller: address,
    user: address,
    total_deposit: z.number(),
    total_deposit_from_user: z.number(),
    total_borrowed: z.number(),
    total_deposit_precise: z.string(),
    total_borrowed_precise: z.string(),
    total_deposit_from_user_precise: z.string(),
    total_deposit_usd_value: z.number(),
    count: z.number(),
    pagination: z.number().nullable(),
    page: z.number().nullable(),
    data: z.array(collateralEvent),
  })
  .transform(camelizeKeys)
  .transform(data => {
    const {
      chain: _chain,
      count: _count,
      data: events,
      page: _page,
      pagination: _pagination,
      totalDepositUsdValue,
      ...summary
    } = data

    return { ...summary, totalDepositUsd: totalDepositUsdValue, events }
  })

export type GetMarketsResponse = z.input<typeof rawGetMarketsResponse>

export type Market = z.infer<typeof market>
export type Snapshot = z.infer<typeof snapshot>
/** More specifically, the markets where a user holds a position */
export type UserMarket = z.infer<typeof userMarket>
export type UserLendingPosition = z.infer<typeof userLendingPosition>
export type UserMarketStats = z.infer<typeof userMarketStats>
export type UserMarketEarnings = z.infer<typeof userMarketEarnings>
export type UserMarketSnapshots = z.infer<typeof getUserMarketSnapshotsResponse>
export type MarketUser = z.infer<typeof marketUser>
export type MarketUsers = z.infer<typeof getMarketUsersResponse>
export type UserCollateralEvents = z.infer<typeof getUserCollateralEventsResponse>
