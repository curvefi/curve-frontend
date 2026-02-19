import { fromEntries, recordEntries } from '../objects.util'
import { toDate } from '../timestamp'
import type * as Models from './models'
import type * as Responses from './responses'

export const parseMarket = (x: Responses.GetMarketsResponse['data'][number]): Models.Market => ({
  name: x.collateral_token.symbol,
  address: x.address,
  factoryAddress: x.factory_address,
  llamma: x.llamma,
  rate: x.rate,
  borrowApy: x.borrow_apy,
  borrowTotalApy: x.borrow_total_apy,
  borrowApr: x.borrow_apr,
  borrowTotalApr: x.borrow_total_apr,
  borrowed: x.total_debt,
  borrowedUsd: x.total_debt_usd,
  borrowable: x.borrowable,
  leverage: x.leverage,
  collateralAmount: x.collateral_amount,
  collateralAmountUsd: x.collateral_amount_usd,
  debtCeiling: x.debt_ceiling,
  loans: x.n_loans,
  collateralToken: {
    symbol: x.collateral_token.symbol,
    address: x.collateral_token.address,
    rebasingYield: x.collateral_token.rebasing_yield,
    rebasingYieldApr: x.collateral_token.rebasing_yield_apr,
  },
  stablecoinToken: {
    symbol: x.stablecoin_token.symbol,
    address: x.stablecoin_token.address,
    rebasingYield: x.stablecoin_token.rebasing_yield,
    rebasingYieldApr: x.stablecoin_token.rebasing_yield_apr,
  },
  fees: {
    pending: x.pending_fees,
    collected: x.collected_fees,
  },
  createdAt: toDate(x.created_at),
  maxLtv: x.max_ltv,
})

export const parseAllMarkets = (resp: Responses.GetAllMarketsResponse) =>
  fromEntries(recordEntries(resp.chains).map(([chain, { data }]) => [chain, data.map(parseMarket)]))

export const parseSnapshot = (x: Responses.GetSnapshotsResponse['data'][number]): Models.Snapshot => ({
  timestamp: toDate(x.dt),
  rate: x.rate,
  borrowApy: x.borrow_apy, // value already in percentage: 0.12 => 0.12%
  borrowApr: x.borrow_apr, // value already in percentage: 0.12 => 0.12%
  nLoans: x.n_loans,
  minted: x.minted,
  redeemed: x.redeemed,
  totalCollateral: x.total_collateral,
  totalCollateralUsd: x.total_collateral_usd,
  totalStablecoin: x.total_stablecoin,
  totalStablecoinUsd: x.total_stablecoin_usd,
  totalDebt: x.total_debt,
  totalDebtUsd: x.total_debt_usd,
  priceAMM: x.amm_price,
  priceOracle: x.price_oracle,
  borrowable: x.borrowable,
  discountLiquidation: x.liquidation_discount,
  discountLoan: x.loan_discount,
  ammA: x.amm_a,
  basePrice: x.base_price,
  minBand: x.min_band,
  maxBand: x.max_band,
  sumDebtSquared: x.sum_debt_squared,
  collateralToken: {
    symbol: x.collateral_token.symbol,
    address: x.collateral_token.address,
    rebasingYield: x.collateral_token.rebasing_yield,
    rebasingYieldApr: x.collateral_token.rebasing_yield_apr,
  },
  stablecoinToken: {
    symbol: x.stablecoin_token.symbol,
    address: x.stablecoin_token.address,
    rebasingYield: x.stablecoin_token.rebasing_yield,
    rebasingYieldApr: x.stablecoin_token.rebasing_yield_apr,
  },
  maxLtv: x.max_ltv,
})

export const parseKeeper = (x: Responses.GetKeepersResponse['keepers'][number]): Models.Keeper => ({
  address: x.address,
  pool: x.pool,
  poolAddress: x.pool_address,
  pair: x.pair.map((p) => ({
    symbol: p.symbol,
    address: p.address,
  })),
  active: x.active,
  totalDebt: x.total_debt,
  totalProfit: x.total_profit,
})

export const parseSupply = (x: Responses.GetSupplyResponse['data'][number]): Models.CrvUsdSupply => ({
  timestamp: toDate(x.timestamp),
  market: x.market,
  supply: x.supply,
  borrowable: x.borrowable,
})

export const parseUserMarkets = (x: Pick<Responses.GetUserMarketsResponse, 'markets'>): Models.UserMarkets =>
  x.markets.map((market) => ({
    collateral: market.collateral,
    controller: market.controller,
    snapshotFirst: toDate(market.first_snapshot),
    snapshotLast: toDate(market.last_snapshot),
  }))

export const parseAllUserMarkets = (x: Responses.GetAllUserMarketsResponse) =>
  fromEntries(recordEntries(x.chains).map(([chain, markets]) => [chain, parseUserMarkets(markets)]))

export const parseUserMarketStats = (x: Responses.GetUserMarketStatsResponse) => ({
  health: x.health,
  healthFull: x.health_full,
  n: x.n,
  n1: x.n1,
  n2: x.n2,
  debt: x.debt,
  collateral: x.collateral,
  collateralUp: x.collateral_up,
  stablecoin: x.stablecoin,
  softLiquidation: x.soft_liquidation,
  totalDeposited: x.total_deposited,
  loss: x.loss,
  lossPct: x.loss_pct,
  oraclePrice: x.oracle_price,
  blockNumber: x.block_number,
  timestamp: toDate(x.timestamp),
})

export const parseUserMarketSnapshots = (x: Responses.GetUserMarketSnapshotsResponse): Models.UserMarketSnapshots =>
  x.data.map(parseUserMarketStats)

export const parseUserCollateralEvents = (
  x: Responses.GetUserCollateralEventsResponse,
): Models.UserCollateralEvents => ({
  controller: x.controller,
  user: x.user,
  totalDeposit: x.total_deposit,
  totalDepositPrecise: x.total_deposit_precise,
  totalDepositUsd: x.total_deposit_usd_value,
  totalBorrowed: x.total_borrowed,
  totalBorrowedPrecise: x.total_borrowed_precise,
  events: x.data.map((y) => ({
    timestamp: toDate(y.dt),
    txHash: y.transaction_hash,
    type: y.type,
    user: y.user,
    collateralChange: y.collateral_change,
    collateralChangeUsd: y.collateral_change_usd ?? undefined,
    loanChange: y.loan_change,
    loanChangeUsd: y.loan_change_usd ?? undefined,
    liquidation:
      y.liquidation === null
        ? undefined
        : {
            user: y.liquidation.user,
            liquidator: y.liquidation.liquidator,
            collateralReceived: y.liquidation.collateral_received,
            collateralReceivedUsd: y.liquidation.collateral_received_usd,
            stablecoinReceived: y.liquidation.stablecoin_received,
            stablecoinReceivedUsd: y.liquidation.stablecoin_received_usd,
            debt: y.liquidation.debt,
            debtUsd: y.liquidation.debt_usd,
          },
    n1: y.n1,
    n2: y.n2,
    oraclePrice: y.oracle_price,
    isPositionClosed: y.is_position_closed,
  })),
})

export const parseCrvUsdTvl = (x: Responses.GetCrvUsdTvlResponse): Models.CrvUsdTvl => ({
  chain: x.chain,
  tvl: x.tvl,
})
