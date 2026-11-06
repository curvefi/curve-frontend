import { sum, sumBy } from 'lodash'
import {
  getCollateralValue,
  getEquityLeverage,
  getLoanToValue,
  getLoopedApr,
  getYieldMultiplier,
} from '@/llamalend/equity-leverage.utils'
import { getLiquidationBuffer } from '@/llamalend/features/market-position-details/market-position-details.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { UserState } from '@/llamalend/queries/user/user-state.query'
import {
  getMarketListYields,
  getSupplyApyMetrics,
  getSupplyCampaigns,
  getUserBoostApr,
  sumCampaignsApr,
  sumCampaignsApy,
  sumExtraIncentivesApy,
} from '@/llamalend/rates.utils'
import type { Amount, Decimal } from '@primitives/decimal.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { combineQueryState } from '@ui/features/queries/combine'
import { q, type Query, type QueryProp, type Range } from '@ui/features/queries/util'
import { decimal, decimalMultiply } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

type UserPositionSummaryMetric = { label: string; metric: QueryProp<Amount> }

export const getUserBorrowedUsd = ({ positionQueries }: LlamaMarketRow) => {
  const borrowed = positionQueries.stats.data?.borrowed
  const usdRate = positionQueries.prices.borrowed.data
  return maybes([borrowed, usdRate], (amount, rate) => amount * rate)
}

export const getUserCollateralUsd = ({ positionQueries }: LlamaMarketRow) => {
  const stats = positionQueries.stats.data
  const collateralUsdRate = positionQueries.prices.collateral.data
  const borrowedUsdRate = stats?.convertedBorrowed === 0 ? 0 : positionQueries.prices.borrowed.data
  return maybes(
    [stats, collateralUsdRate, borrowedUsdRate],
    (stats, collateralRate, borrowedRate) => stats.collateral * collateralRate + stats.convertedBorrowed * borrowedRate,
  )
}

/** Maps the position to the user state (collateral, borrowed tokens in the AMM, debt) */
const mapPosition = <R>(
  { positionQueries }: LlamaMarketRow,
  mapper: (position: UserState, oraclePrice: Decimal) => R,
) => maybe(positionQueries.stats.data, ({ position, oraclePrice }) => maybes([position, oraclePrice], mapper))

/** Debt over the collateral value at the oracle price, plus the tokens converted in soft liquidation */
export const getUserPositionLtv = (row: LlamaMarketRow) =>
  maybe(
    mapPosition(row, (position, price) => getLoanToValue(position.debt, getCollateralValue(position, price))),
    Number,
  )

/** Share of the collateral value still in the collateral token, in percent, the rest was converted in soft liquidation */
export const getUserCollateralShare = (row: LlamaMarketRow) =>
  maybe(
    mapPosition(row, (position, price) =>
      getLoanToValue(decimalMultiply(position.collateral, price), getCollateralValue(position, price)),
    ),
    Number,
  )

/** Only for zap leveraged positions */
export const getUserLeverage = (row: LlamaMarketRow) =>
  row.positionQueries.isZapLeveraged.data ? maybe(mapPosition(row, getEquityLeverage), Number) : undefined

/** Only for zap leveraged positions */
const getLoopedAprDecimal = (row: LlamaMarketRow) =>
  row.positionQueries.isZapLeveraged.data
    ? mapPosition(row, (position, price) =>
        getLoopedApr(position, price, decimal(row.rates.borrowApr), getMarketListYields(row)),
      )
    : undefined

export const getUserLoopedApr = (row: LlamaMarketRow) => maybe(getLoopedAprDecimal(row), Number)

/** How many times the collateral yield the equity earns */
export const getUserYieldMultiplier = (row: LlamaMarketRow) =>
  maybe(getYieldMultiplier(getLoopedAprDecimal(row) ?? null, getMarketListYields(row).collateralYieldApr), Number)

export const getUserLiquidationBuffer = ({
  positionQueries,
  parameters: { loanDiscount, liquidationDiscount },
}: LlamaMarketRow) =>
  maybe(positionQueries.stats.data?.healthNotFull, health =>
    maybe(getLiquidationBuffer(health, loanDiscount, liquidationDiscount), Number),
  )

/** The part of the debt the band-valued health stands for, in the borrowed token */
export const getUserLiquidationBufferAmount = ({ positionQueries }: LlamaMarketRow) =>
  maybe(positionQueries.stats.data, ({ borrowed, healthNotFull }) =>
    maybe(healthNotFull, health => (borrowed * +health) / 100),
  )

export const getUserBandCount = ({ positionQueries }: LlamaMarketRow) => positionQueries.stats.data?.bandCount

/** Supply APY metrics at the user's boost */
export const getUserSupplyApyMetrics = ({ rates, assets, rewards, lendingPosition }: LlamaMarket) =>
  getSupplyApyMetrics({
    supplyApy: rates.lendApy,
    crvBoostApr: maybes([rates.lendCrvAprUnboosted, rates.lendCrvAprBoosted], (min, max): Range<number> => [min, max]),
    rebasingYieldApy: assets.borrowed.rebasingYield,
    extraIncentivesApy: sumExtraIncentivesApy(rates.incentives.map(({ percentage }) => percentage)),
    campaignsApy: sumCampaignsApy(getSupplyCampaigns(rewards)),
    userSupplyBoost: decimal(lendingPosition?.boostMultiplier),
  })

/** Total supply APY at the user's boost, or at the minimum boost when the user has none */
export const getUserSupplyTotalApy = (market: LlamaMarket) =>
  getUserSupplyApyMetrics(market).totalUserBoost ?? market.rates.lendTotalApyMinBoosted

/** The user's share of the vault's assets, in percent */
export const getUserSupplyShare = ({ lendingPosition, assets }: LlamaMarketRow) =>
  maybes([lendingPosition?.supplied, assets.collateral.balance], (supplied, totalAssets) =>
    totalAssets ? (supplied / totalAssets) * 100 : undefined,
  )

/** CRV rewards at the user's boost (none when the market has no CRV rewards), extra incentives and supply campaigns, as APR in percent */
export const getUserIncentivesApr = ({ rates, rewards, lendingPosition }: LlamaMarketRow) => {
  const campaignsApr = sumCampaignsApr(getSupplyCampaigns(rewards))
  return rates.lendCrvAprUnboosted == null && !rates.incentives.length && campaignsApr == null
    ? undefined
    : getUserBoostApr(rates.lendCrvAprUnboosted ?? 0, lendingPosition?.boostMultiplier ?? 1) +
        sumBy(rates.incentives, 'percentage') +
        (campaignsApr ?? 0)
}

export const getUserLegacyHealth = ({ positionQueries }: LlamaMarketRow) => positionQueries.stats.data?.legacyHealth

export const getUserHealthFactor = ({ positionQueries }: LlamaMarketRow) =>
  maybe(positionQueries.stats.data?.healthFactor, Number)

export const getUserEquityUsd = ({ positionQueries }: LlamaMarketRow) => positionQueries.equityUsd.data

/** PNL in the debt token, in USD at the borrowed token's USD rate */
export const getUserPnlUsd = ({ positionQueries }: LlamaMarketRow) => positionQueries.pnlUsd.data

const getUserSuppliedUsd = ({ lendingPosition, positionQueries }: LlamaMarketRow) => {
  const supplied = lendingPosition?.supplied
  const usdRate = positionQueries.prices.borrowed.data
  return maybes([supplied, usdRate], (amount, rate) => amount * rate)
}

const createMetric = <T extends Amount>(label: string, metric: QueryProp<T>): UserPositionSummaryMetric => ({
  label,
  metric,
})

const aggregate = (queries: Query<unknown>[], values: (number | undefined)[]) =>
  q({ data: sum(values.map(value => value ?? 0)), ...combineQueryState(...queries) })

/** Build the summary from the same enriched rows used by the table and its sort accessors. */
export const getUserPositionsSummary = (markets: LlamaMarketRow[] = []): UserPositionSummaryMetric[] => {
  const borrowMarkets = markets.filter(({ userHasPositions }) => userHasPositions?.Borrow)
  const supplyMarkets = markets.filter(({ userHasPositions }) => userHasPositions?.Supply)
  const borrowQueries = borrowMarkets.flatMap(({ positionQueries: { stats, prices } }) => [stats, prices.borrowed])
  const collateralQueries = [
    ...borrowQueries,
    ...borrowMarkets.map(({ positionQueries: { prices } }) => prices.collateral),
  ]
  const supplyQueries = supplyMarkets.map(({ positionQueries: { prices } }) => prices.borrowed)

  return [
    createMetric(t`Total Collateral`, aggregate(collateralQueries, borrowMarkets.map(getUserCollateralUsd))),
    createMetric(t`Total Borrowed`, aggregate(borrowQueries, borrowMarkets.map(getUserBorrowedUsd))),
    createMetric(t`Total Supplied`, aggregate(supplyQueries, supplyMarkets.map(getUserSuppliedUsd))),
  ]
}
