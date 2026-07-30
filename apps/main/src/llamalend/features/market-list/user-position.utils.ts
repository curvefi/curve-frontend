import { sum } from 'lodash'
import { calculateLtv } from '@/llamalend/llama.utils'
import { getAvailableQueryData, type LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import type { Amount } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { q, type Query, type QueryProp } from '@ui-kit/types/util'

export type UserPositionSummaryMetric = { label: string; metric: QueryProp<Amount> }

export const getUserBorrowedUsd = ({ positionQueries }: LlamaMarketRow) => {
  const borrowed = getAvailableQueryData(positionQueries.stats)?.borrowed
  const usdRate = getAvailableQueryData(positionQueries.prices.borrowed)
  return maybes([borrowed, usdRate], (amount, rate) => amount * rate)
}

export const getUserCollateralUsd = ({ positionQueries }: LlamaMarketRow) => {
  const stats = getAvailableQueryData(positionQueries.stats)
  const collateralUsdRate = getAvailableQueryData(positionQueries.prices.collateral)
  const borrowedUsdRate = stats?.borrowToken === 0 ? 0 : getAvailableQueryData(positionQueries.prices.borrowed)
  return maybes(
    [stats, collateralUsdRate, borrowedUsdRate],
    (stats, collateralRate, borrowedRate) => stats.collateral * collateralRate + stats.borrowToken * borrowedRate,
  )
}

export const getUserPositionLtv = ({ positionQueries }: LlamaMarketRow) => {
  const stats = getAvailableQueryData(positionQueries.stats)
  const borrowedUsdRate = getAvailableQueryData(positionQueries.prices.borrowed)
  const collateralUsdRate = getAvailableQueryData(positionQueries.prices.collateral)
  return maybes([stats, borrowedUsdRate, collateralUsdRate], (stats, borrowedRate, collateralRate) =>
    calculateLtv(stats.borrowed, stats.collateral, stats.borrowToken, borrowedRate, collateralRate),
  )
}

export const getUserPositionHealth = ({ positionQueries }: LlamaMarketRow) =>
  getAvailableQueryData(positionQueries.stats)?.health

export const getUserSuppliedUsd = ({ lendingPosition, positionQueries }: LlamaMarketRow) => {
  const supplied = lendingPosition?.supplied
  const usdRate = getAvailableQueryData(positionQueries.prices.borrowed)
  return maybes([supplied, usdRate], (amount, rate) => amount * rate)
}

const createMetric = <T extends Amount>(label: string, metric: QueryProp<T>): UserPositionSummaryMetric => ({
  label,
  metric,
})

const aggregate = (queries: Query<unknown>[], values: (number | undefined)[]) =>
  q({
    data: sum(values.map(value => value ?? 0)),
    ...combineQueryState(...queries),
  })

/** Build the summary from the same enriched rows used by the table and its sort accessors. */
export const getUserPositionsSummary = (markets: LlamaMarketRow[] = []): UserPositionSummaryMetric[] => {
  const borrowMarkets = markets.filter(({ userHasPositions }) => userHasPositions?.Borrow)
  const supplyMarkets = markets.filter(({ userHasPositions }) => userHasPositions?.Supply)
  const borrowQueries = borrowMarkets.flatMap(({ positionQueries: { stats, prices } }) => [
    stats,
    prices.borrowed,
    prices.collateral,
  ])
  const supplyQueries = supplyMarkets.map(({ positionQueries: { prices } }) => prices.borrowed)

  return [
    createMetric(t`Total Collateral`, aggregate(borrowQueries, borrowMarkets.map(getUserCollateralUsd))),
    createMetric(t`Total Borrowed`, aggregate(borrowQueries, borrowMarkets.map(getUserBorrowedUsd))),
    createMetric(t`Total Supplied`, aggregate(supplyQueries, supplyMarkets.map(getUserSuppliedUsd))),
  ]
}
