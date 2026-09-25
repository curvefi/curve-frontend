import { sum } from 'lodash'
import {
  collateralTokenValue,
  collateralValue,
  equity,
  oracleHealth,
} from '@/llamalend/features/market-position-details/position-metrics.utils'
import { positionReturnOnEquity, type YieldInput } from '@/llamalend/features/market-position-details/position-roe.utils'
import { resolvePositionStatus } from '@/llamalend/features/market-position-details/position-status.utils'
import { calculateLtv } from '@/llamalend/llama.utils'
import { getMarketAssetsType } from '@/llamalend/market-assets-type.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { requireChainId } from '@evm-ui/utils'
import type { Amount } from '@primitives/decimal.utils'
import { type Nullish, maybe, maybes } from '@primitives/objects.utils'
import { combineQueryState } from '@ui/features/queries/combine'
import { q, type Query, type QueryProp } from '@ui/features/queries/util'
import { ZERO, decimal, decimalDiv, decimalEqual } from '@ui/lib/decimal'
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
export const getUserPositionBuffer = ({ positionQueries }: LlamaMarketRow) => maybe(positionQueries.risk.fullHealth.data, value => Number(value))

const aprFraction = (percentagePoints: number | Nullish): YieldInput => {
  if (percentagePoints == null) return { unavailable: true }
  const points = decimal(percentagePoints)
  const hundred = decimal('100')
  if (points == undefined || hundred == undefined) return { unavailable: true }
  const fraction = decimalDiv(points, hundred)
  return fraction == undefined ? { unavailable: true } : { aprFraction: fraction }
}

/** Position return on equity, the same balance formula as the position card. Undefined until the inputs exist. */
export const getUserPositionRoeResult = (row: LlamaMarketRow) => {
  const stats = row.positionQueries.stats.data
  if (!stats) return undefined
  const oracle = decimal(stats.oraclePrice)
  const collateral = decimal(stats.collateral)
  const borrowed = decimal(stats.borrowToken)
  const debt = decimal(stats.borrowed)
  if (oracle == undefined || collateral == undefined || borrowed == undefined || debt == undefined) return undefined
  const tokenValue = collateralTokenValue(collateral, oracle)
  const equityAmount = equity(collateralValue(collateral, oracle, borrowed), debt)
  const collateralApr = row.assets.collateral.rebasingYieldApr
  const borrowedApr = row.assets.borrowed.rebasingYieldApr
  const result = positionReturnOnEquity({
    collateralValue: tokenValue,
    borrowedValue: borrowed,
    debt,
    equity: equityAmount,
    collateralYield: decimalEqual(tokenValue, ZERO) ? { unnecessary: true } : aprFraction(collateralApr),
    borrowedYield: decimalEqual(borrowed, ZERO) ? { unnecessary: true } : aprFraction(borrowedApr),
    borrowCost: decimalEqual(debt, ZERO) ? { unnecessary: true } : aprFraction(row.rates.borrowApr),
    rewards: { unnecessary: true },
  })
  return result.status === 'value' ? result : undefined
}

/** APR percent used to sort the RoE column. Unknown positions sort last. */
export const getUserPositionRoe = (row: LlamaMarketRow) => {
  const result = getUserPositionRoeResult(row)
  return result ? Number(result.aprPercent) : undefined
}

/** Beta sorts by the oracle ratio and leaves unknowns last. Flag-off keeps the old percentage. */
export const getHealthColumnSortValue = (row: LlamaMarketRow) =>
  row.positionQueries.risk.beta ? getUserPositionOracleHealth(row) : getUserPositionHealth(row)

export const getUserPositionStatus = (row: LlamaMarketRow) => {
  const { oracle, prices, fullHealth } = row.positionQueries.risk
  const collateral = row.positionQueries.stats.data?.collateral
  const quantity = decimal(collateral)
  if (!oracle.data || !prices.data || fullHealth.data == undefined || quantity == undefined) return undefined
  return resolvePositionStatus({
    oraclePrice: oracle.data,
    upperPrice: prices.data[1],
    lowerPrice: prices.data[0],
    fullHealth: fullHealth.data,
    collateralQuantity: quantity,
    liquidationPredicate: 'strict-negative',
    assetsType: getMarketAssetsType(requireChainId(row.chain), row.controllerAddress),
  })
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
