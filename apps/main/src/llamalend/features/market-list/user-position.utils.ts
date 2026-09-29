import { sum } from 'lodash'
import {
  collateralTokenValue,
  collateralValue,
  compositionShares,
  equity,
  leverage,
  inclusiveBandCount,
  oracleHealth,
  priceDistance,
} from '@/llamalend/features/market-position-details/position-metrics.utils'
import { listedPositionRoe } from '@/llamalend/features/market-position-details/position-roe.utils'
import { resolvePositionStatus } from '@/llamalend/features/market-position-details/position-status.utils'
import { calculateLtv } from '@/llamalend/llama.utils'
import { getMarketAssetsType } from '@/llamalend/market-assets-type.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { sumCampaignsApr } from '@/llamalend/rates.utils'
import { requireChainId } from '@evm-ui/utils'
import type { Amount } from '@primitives/decimal.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { combineQueryState } from '@ui/features/queries/combine'
import { q, type Query, type QueryProp } from '@ui/features/queries/util'
import { decimal } from '@ui/lib/decimal'
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
  const borrowedUsdRate = stats?.borrowToken === 0 ? 0 : positionQueries.prices.borrowed.data
  return maybes(
    [stats, collateralUsdRate, borrowedUsdRate],
    (stats, collateralRate, borrowedRate) => stats.collateral * collateralRate + stats.borrowToken * borrowedRate,
  )
}

export const getUserPositionLtv = ({ positionQueries }: LlamaMarketRow) => {
  const stats = positionQueries.stats.data
  const borrowedUsdRate = positionQueries.prices.borrowed.data
  const collateralUsdRate = positionQueries.prices.collateral.data
  return maybes(
    [stats, borrowedUsdRate, collateralUsdRate],
    (stats, borrowedRate, collateralRate) =>
      calculateLtv(stats.borrowed, stats.collateral, stats.borrowToken, borrowedRate, collateralRate) || undefined,
  )
}

export const getUserPositionHealth = ({ positionQueries }: LlamaMarketRow) => positionQueries.stats.data?.health

/** Card Health: max(oracle / user-range upper, 1). Undefined until those reads settle. */
export const getUserPositionOracleHealth = ({ positionQueries }: LlamaMarketRow) => {
  const oracle = positionQueries.risk.oracle.data
  const prices = positionQueries.risk.prices.data
  if (!oracle || !prices) return undefined
  return maybe(oracleHealth(oracle, prices[1]), value => Number(value))
}

/** Card liquidation buffer: Controller userHealth(full), in percentage points. */
export const getUserPositionBuffer = ({ positionQueries }: LlamaMarketRow) =>
  maybe(positionQueries.risk.fullHealth.data, value => Number(value))

export const getUserPositionRangeUpper = ({ positionQueries }: LlamaMarketRow) =>
  maybe(positionQueries.risk.prices.data?.[1], value => Number(value))

export const getUserPositionPriceDistance = ({ positionQueries }: LlamaMarketRow) => {
  const oracle = positionQueries.risk.oracle.data
  const prices = positionQueries.risk.prices.data
  if (!oracle || !prices) return undefined
  return priceDistance(oracle, prices[1], prices[0])
}

/** True when the oracle is inside the user's liquidation range, including either boundary. */
export const isUserPositionInRange = (row: LlamaMarketRow) => getUserPositionPriceDistance(row)?.location === 'inside'

/** Percent away from the range. Inside is 0. Unknown positions sort last. */
export const getUserPositionDistance = (row: LlamaMarketRow) => {
  const distance = getUserPositionPriceDistance(row)
  if (!distance || distance.location === 'unavailable') return undefined
  if (distance.location === 'inside') return 0
  return Number(distance.percent)
}

/** Inclusive band count between the user's n1 and n2 indexes. */
export const getUserPositionBandCount = ({ positionQueries }: LlamaMarketRow) => {
  const stats = positionQueries.stats.data
  if (!stats) return undefined
  return inclusiveBandCount(stats.n1, stats.n2)
}

const readCollateralAmounts = (row: LlamaMarketRow) => {
  const stats = row.positionQueries.stats.data
  if (!stats) return undefined
  const oracle = decimal(stats.oraclePrice)
  const collateral = decimal(stats.collateral)
  const borrowed = decimal(stats.borrowToken)
  if (oracle == undefined || collateral == undefined || borrowed == undefined) return undefined
  const tokenValue = collateralTokenValue(collateral, oracle)
  const assets = collateralValue(collateral, oracle, borrowed)
  return { oracle, collateral, borrowed, tokenValue, assets }
}

const readBorrowAmounts = (row: LlamaMarketRow) => {
  const amounts = readCollateralAmounts(row)
  const debt = decimal(row.positionQueries.stats.data?.borrowed)
  if (!amounts || debt == undefined) return undefined
  return { ...amounts, debt, equity: equity(amounts.assets, debt) }
}

/** Current collateral and converted-borrow shares. Undefined when the position value is zero. */
export const getUserPositionComposition = (row: LlamaMarketRow) => {
  const amounts = readCollateralAmounts(row)
  if (!amounts) return undefined
  return compositionShares(amounts.tokenValue, amounts.assets)
}

/** Collateral share of the position's current value, used to sort composition. */
export const getUserPositionCollateralShare = (row: LlamaMarketRow) =>
  maybe(getUserPositionComposition(row), shares => Number(shares.collateralExact))

/** Position return on equity, the same balance formula as the position card. Undefined until the inputs exist. */
export const getUserPositionRoeResult = (row: LlamaMarketRow) => {
  const amounts = readBorrowAmounts(row)
  if (!amounts) return undefined
  const result = listedPositionRoe({
    collateralValue: amounts.tokenValue,
    borrowedValue: amounts.borrowed,
    debt: amounts.debt,
    equity: amounts.equity,
    collateralApr: row.assets.collateral.rebasingYieldApr,
    borrowedApr: row.assets.borrowed.rebasingYieldApr,
    borrowApr: row.rates.borrowApr,
  })
  return result.status === 'value' ? result : undefined
}

/** APR percent used to sort the RoE column. Unknown positions sort last. */
export const getUserPositionRoe = (row: LlamaMarketRow) =>
  maybe(getUserPositionRoeResult(row), result => Number(result.aprPercent))

/** Uses the position card's collateral exposure over equity formula. */
export const getUserPositionLeverage = (row: LlamaMarketRow) => {
  const amounts = readBorrowAmounts(row)
  if (!amounts) return undefined
  return maybe(leverage(amounts.tokenValue, amounts.equity), value => Number(value))
}

/** Beta sorts by the oracle ratio and leaves unknowns last. Flag-off keeps the old percentage. */
export const getHealthColumnSortValue = (row: LlamaMarketRow) =>
  row.positionQueries.risk.beta ? getUserPositionOracleHealth(row) : getUserPositionHealth(row)

export const getUserPositionStatus = (row: LlamaMarketRow) => {
  const { oracle, prices, fullHealth } = row.positionQueries.risk
  const debt = decimal(row.positionQueries.stats.data?.borrowed)
  if (!oracle.data || !prices.data || fullHealth.data == undefined || debt == undefined) return undefined
  return resolvePositionStatus({
    oraclePrice: oracle.data,
    upperPrice: prices.data[1],
    lowerPrice: prices.data[0],
    fullHealth: fullHealth.data,
    debt,
    liquidationPredicate: 'strict-negative',
    assetsType: getMarketAssetsType(requireChainId(row.chain), row.controllerAddress),
  })
}

/** Supplied assets as a percent of the vault's total assets. */
export const getUserSupplyShare = (row: LlamaMarketRow) => {
  const supplied = row.lendingPosition?.supplied
  if (supplied == null) return undefined
  const totalAssets = row.liquidity + (row.assets.borrowed.balance ?? 0)
  if (!Number.isFinite(totalAssets) || totalAssets <= 0) return undefined
  return (supplied / totalAssets) * 100
}

/** CRV at the user's boost, plus other supply incentive APRs. */
export const getSupplyIncentivesApr = (row: LlamaMarketRow) => {
  const unboosted = row.rates.lendCrvAprUnboosted
  const boost = row.lendingPosition?.boostMultiplier
  const boostedCrvApr = boost != null && boost > 0 && unboosted != null ? unboosted * boost : unboosted
  const crvApr = boostedCrvApr ?? 0
  const extraApr = sum(row.rates.incentives.map(incentive => incentive.percentage))
  const campaignsApr = sumCampaignsApr(row.rewards.filter(reward => reward.action === 'supply')) ?? 0
  return crvApr + extraApr + campaignsApr
}

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
