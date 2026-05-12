import { z } from 'zod/v4'
import { fromEntries, recordEntries } from '@primitives/objects.utils'
import type { Chain } from '..'
import { address, chain, timestampResponse } from '../schemas'
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
  .transform(data => ({
    symbol: data.symbol,
    address: data.address,
    rebasingYield: data.rebasing_yield,
    rebasingYieldApr: data.rebasing_yield_apr,
  }))

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
  .transform(data => ({
    name: data.name,
    version: parseMarketVersion(data.version),
    controller: data.controller,
    vault: data.vault,
    llamma: data.llamma,
    policy: data.policy,
    oracle: data.oracle,
    oraclePools: data.oracle_pools,
    rate: data.rate,
    // borrowApy = rate * 100
    borrowApy: data.borrow_apy,
    // @deprecated compute this using borrowApy and collateralToken.rebasingYield
    borrowTotalApy: data.borrow_total_apy,
    borrowApr: data.borrow_apr,
    // @deprecated compute this using borrowApr and collateralToken.rebasingYieldApr
    borrowTotalApr: data.borrow_total_apr,
    apyLend: data.lend_apy,
    aprLend: data.lend_apr,
    aprLendCrv0Boost: data.lend_apr_crv_0_boost,
    aprLendCrvMaxBoost: data.lend_apr_crv_max_boost,
    nLoans: data.n_loans,
    priceOracle: data.price_oracle,
    ammPrice: data.amm_price,
    basePrice: data.base_price,
    totalDebt: data.total_debt, // Borrowed
    totalAssets: data.total_assets, // Supplied
    totalDebtUsd: data.total_debt_usd,
    totalAssetsUsd: data.total_assets_usd,
    minted: data.minted,
    mintedUsd: data.minted_usd,
    redeemed: data.redeemed,
    redeemedUsd: data.redeemed_usd,
    loanDiscount: data.loan_discount,
    liquidationDiscount: data.liquidation_discount,
    minBand: data.min_band,
    maxBand: data.max_band,
    collateralBalance: data.collateral_balance, // Collateral (like CRV)
    collateralBalanceUsd: data.collateral_balance_usd,
    borrowedBalance: data.borrowed_balance, // Collateral (like crvUSD)
    borrowedBalanceUsd: data.borrowed_balance_usd,
    collateralToken: data.collateral_token,
    borrowedToken: data.borrowed_token,
    leverage: data.leverage,
    extraRewardApr: data.extra_reward_apr,
    createdAt: parseTimestamp(data.created_at),
    maxLtv: data.max_ltv,
  }))

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
  .transform(data => ({
    rate: data.rate,
    borrowApy: data.borrow_apy, // value already in percentage: 0.12 => 0.12%
    borrowApr: data.borrow_apr, // value already in percentage: 0.12 => 0.12%
    lendApy: data.lend_apy / 100,
    lendApr: data.lend_apr / 100,
    lendAprCrv0Boost: data.lend_apr_crv_0_boost / 100,
    lendAprCrvMaxBoost: data.lend_apr_crv_max_boost / 100,
    numLoans: data.n_loans,
    priceOracle: data.price_oracle,
    ammPrice: data.amm_price,
    totalDebt: data.total_debt,
    totalDebtUsd: data.total_debt_usd,
    totalAssets: data.total_assets,
    totalAssetsUsd: data.total_assets_usd,
    minted: data.minted,
    redeemed: data.redeemed,
    collateralBalance: data.collateral_balance,
    collateralBalanceUsd: data.collateral_balance_usd,
    borrowedBalance: data.borrowed_balance,
    borrowedBalanceUsd: data.borrowed_balance_usd,
    timestamp: parseTimestamp(data.timestamp),
    discountLiquidation: data.liquidation_discount,
    discountLoan: data.loan_discount,
    basePrice: data.base_price,
    mintedUsd: data.minted_usd,
    redeemedUsd: data.redeemed_usd,
    minBand: data.min_band,
    maxBand: data.max_band,
    ammA: data.amm_a,
    sumDebtSquared: data.sum_debt_squared,
    extraRewardApr: data.extra_rewards_apr,
    collateralToken: data.collateral_token,
    borrowedToken: data.borrowed_token,
    maxLtv: data.max_ltv,
  }))

const userMarket = z
  .object({
    market_name: z.string(),
    controller: address,
    first_snapshot: timestampResponse,
    last_snapshot: timestampResponse,
  })
  .transform(data => ({
    name: data.market_name,
    controller: data.controller,
    snapshotFirst: parseTimestamp(data.first_snapshot),
    snapshotLast: parseTimestamp(data.last_snapshot),
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
  .transform(data => ({
    marketName: data.market_name,
    vaultAddress: data.vault_address,
    firstDeposit: parseTimestamp(data.first_deposit),
    lastActivity: parseTimestamp(data.last_activity),
    currentShares: parseFloat(data.current_shares),
    currentSharesInGauge: parseFloat(data.current_shares_in_gauge),
    boostMultiplier: data.boost_multiplier,
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
    borrowed: data.borrowed,
    softLiquidation: data.soft_liquidation,
    totalDeposited: data.total_deposited,
    loss: data.loss,
    lossPct: data.loss_pct,
    collateralUp: data.collateral_up,
    oraclePrice: data.oracle_price,
    blockNumber: data.block_number,
    timestamp: parseTimestamp(data.timestamp),
  }))

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
  .transform(data => ({
    user: data.user,
    earnings: parseFloat(data.earnings),
    deposited: parseFloat(data.deposited),
    withdrawn: parseFloat(data.withdrawn),
    transfersInShares: parseFloat(data.transfers_in_shares),
    transfersOutAssets: parseFloat(data.transfers_out_assets),
    transfersInAssets: parseFloat(data.transfers_in_assets),
    transfersOutShares: parseFloat(data.transfers_out_shares),
    transfersSharesToGauge: parseFloat(data.transfers_shares_to_gauge),
    transfersSharesFromGauge: parseFloat(data.transfers_shares_from_gauge),
    transfersAssetsToGauge: parseFloat(data.transfers_assets_to_gauge),
    transfersAssetsFromGauge: parseFloat(data.transfers_assets_from_gauge),
    transfersSharesToConvex: parseFloat(data.transfers_shares_to_convex),
    transfersSharesFromConvex: parseFloat(data.transfers_shares_from_convex),
    transfersAssetsToConvex: parseFloat(data.transfers_assets_to_convex),
    transfersAssetsFromConvex: parseFloat(data.transfers_assets_from_convex),
    currentShares: parseFloat(data.current_shares),
    currentSharesInGauge: parseFloat(data.current_shares_in_gauge),
    currentSharesInConvex: parseFloat(data.current_shares_in_convex),
    currentAssets: parseFloat(data.current_assets),
    currentAssetsInGauge: parseFloat(data.current_assets_in_gauge),
    currentAssetsInConvex: parseFloat(data.current_assets_in_convex),
    totalCurrentShares: parseFloat(data.total_current_shares),
    totalCurrentAssets: parseFloat(data.total_current_assets),
    boostMultiplier: data.boost_multiplier,
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
  .transform(data => ({
    user: data.user,
    first: parseTimestamp(data.first),
    last: parseTimestamp(data.last),
    debt: parseFloat(data.debt),
    health: parseFloat(data.health),
    healthFull: parseFloat(data.health_full),
    loss: parseFloat(data.loss),
    borrowed: parseFloat(data.borrowed ?? data.stablecoin ?? '0'),
    collateral: parseFloat(data.collateral ?? '0'),
    softLiquidation: data.soft_liquidation,
  }))

const collateralEvent = z
  .object({
    dt: timestampResponse,
    transaction_hash: address,
    type: z.enum(['Borrow', 'Deposit']),
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
        stablecoin_received: z.number(),
        collateral_received_usd: z.number(),
        stablecoin_received_usd: z.number(),
        debt: z.number(),
        debt_usd: z.number(),
      })
      .nullable(),
    leverage: z
      .object({
        event_type: z.string(),
        user: address,
        user_borrowed: z.number(),
        user_collateral: z.number(),
        user_collateral_from_borrowed: z.number(),
        user_collateral_used: z.number(),
        debt: z.number(),
        leverage_collateral: z.number(),
        state_collateral_used: z.number(),
        borrowed_from_state_collateral: z.number(),
        borrowed_from_user_collateral: z.number(),
      })
      .nullable(),
    n1: z.number(),
    n2: z.number(),
    oracle_price: z.number(),
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
    leverage:
      data.leverage === null
        ? undefined
        : {
            type: data.leverage.event_type,
            user: data.leverage.user,
            userCollateral: data.leverage.user_collateral,
            userCollateralFromBorrowed: data.leverage.user_collateral_from_borrowed,
            userCollateralUsed: data.leverage.user_collateral_used,
            userBorrowed: data.leverage.user_borrowed,
            debt: data.leverage.debt,
            leverageCollateral: data.leverage.leverage_collateral,
            stateCollateralUsed: data.leverage.state_collateral_used,
            borrowedFromStateCollateral: data.leverage.borrowed_from_state_collateral,
            borrowedFromUserCollateral: data.leverage.borrowed_from_user_collateral,
          },
    n1: data.n1,
    n2: data.n2,
    oraclePrice: data.oracle_price,
  }))

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
  .transform(data => ({
    controller: data.controller,
    user: data.user,
    totalDeposit: data.total_deposit,
    totalDepositUsd: data.total_deposit_usd_value,
    totalDepositFromUser: data.total_deposit_from_user,
    totalDepositFromUserPrecise: data.total_deposit_from_user_precise,
    totalDepositPrecise: data.total_deposit_precise,
    totalBorrowed: data.total_borrowed,
    totalBorrowedPrecise: data.total_borrowed_precise,
    events: data.data,
  }))

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
