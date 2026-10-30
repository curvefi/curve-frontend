import { sum } from 'lodash'
import { getEquity } from '@/llamalend/equity-leverage.utils'
import { calculateLtv } from '@/llamalend/llama.utils'
import { getPositionPnlAndRoi } from '@/llamalend/position-pnl.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
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

const getUserEquity = ({ positionQueries }: LlamaMarketRow) =>
  maybe(positionQueries.stats.data, ({ collateral, borrowToken, borrowed, oraclePrice }) =>
    maybes(
      [decimal(collateral), decimal(borrowToken), decimal(borrowed), decimal(oraclePrice)],
      (collateral, stablecoin, debt, oraclePrice) => ({
        equity: getEquity({ collateral, stablecoin, debt }, oraclePrice),
        oraclePrice,
      }),
    ),
  )

/** Equity in USD, at the borrowed token's USD rate */
export const getUserEquityUsd = (row: LlamaMarketRow) =>
  maybes(
    [getUserEquity(row)?.equity, row.positionQueries.prices.borrowed.data],
    (equity, rate) => Number(equity) * rate,
  )

/** PNL of the open borrow position, undefined until its stats and collateral events load */
export const getUserPnl = (row: LlamaMarketRow) =>
  maybes([getUserEquity(row), row.positionQueries.capital.data], ({ equity, oraclePrice }, capital) =>
    getPositionPnlAndRoi({ equity, oraclePrice, capital }),
  )

/** PNL in the debt token, in USD at the borrowed token's USD rate */
export const getUserPnlUsd = (row: LlamaMarketRow) =>
  maybes([getUserPnl(row)?.debt.pnl, row.positionQueries.prices.borrowed.data], (pnl, rate) => Number(pnl) * rate)

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
