import { uniqBy } from 'lodash'
import { useMemo } from 'react'
import { getEquity } from '@/llamalend/equity-leverage.utils'
import { getLegacyHealthValues } from '@/llamalend/features/market-position-details/market-position-details.utils'
import { getPositionEventsSummaryOptions } from '@/llamalend/features/user-position-history/queries/position-events-summary'
import {
  getDisplayLegacyHealth,
  getLegacyLiquidationStatus,
  isBelowRange,
  isZapV0MintMarket,
} from '@/llamalend/llama.utils'
import { getPositionPnlAndRoi, type PositionPnlAndRoi } from '@/llamalend/position-pnl.utils'
import { getUserLendingVaultStatsOptions } from '@/llamalend/queries/market-list/lending-vaults'
import type { LlamaMarket, LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import { getUserMintMarketsStatsOptions } from '@/llamalend/queries/market-list/mint-markets'
import type { UserState } from '@/llamalend/queries/user/user-state.query'
import type { Chain } from '@curvefi/prices-api'
import { useLlamalendPositionPnl } from '@evm-ui/hooks/useFeatureFlags'
import { getTokenUsdRateQueryOptions } from '@evm-ui/queries/token-usd-rate.query'
import { MarketType } from '@evm-ui/types/market'
import { requireChainId } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { useQueries } from '@ui/features/queries/query-hooks'
import { DISABLED_Q, mapQuery, q, type QueryOptionsData, type QueryProp } from '@ui/features/queries/util'
import { decimal } from '@ui/lib/decimal'

type LendBorrowStats = QueryOptionsData<ReturnType<typeof getUserLendingVaultStatsOptions>>
type MintBorrowStats = QueryOptionsData<ReturnType<typeof getUserMintMarketsStatsOptions>>
type BorrowStats = LendBorrowStats | MintBorrowStats
type TokenPrice = number

type TokenPriceEntry = { chainId: number; tokenAddress: Address }

const getTokenPriceKey = ({ chainId, tokenAddress }: TokenPriceEntry) => `${chainId}:${tokenAddress.toLowerCase()}`

const normalizeMarketStats = (stats: BorrowStats) => {
  const convertedBorrowed = 'stablecoin' in stats ? stats.stablecoin : stats.borrowed
  const oraclePrice = decimal(stats.oraclePrice)
  const position = maybes(
    [decimal(stats.collateral), decimal(convertedBorrowed), decimal(stats.debt)],
    (collateral, convertedBorrowed, debt): UserState => ({ collateral, convertedBorrowed, debt }),
  )
  return {
    status: getLegacyLiquidationStatus(
      decimal(stats.health),
      stats.softLiquidation,
      isBelowRange(stats.activeBand, stats.n2),
      decimal(stats.collateral),
      decimal(convertedBorrowed),
    ),
    legacyHealth: getDisplayLegacyHealth(stats.healthFull, stats.health) ?? undefined,
    healthFactor: maybes(
      [decimal(stats.healthFull), decimal(stats.health)],
      (full, notFull) => getLegacyHealthValues(full, notFull).healthFactor,
    ),
    /** Band-valued health in percent of the debt, for the liquidation buffer */
    healthNotFull: decimal(stats.health),
    bandCount: stats.n,
    borrowed: stats.debt,
    collateral: stats.collateral,
    /**
     * During soft liquidation part of the deposited collateral is converted into the borrow token.
     */
    convertedBorrowed,
    oraclePrice,
    /** The same position as the user state query */
    position,
    /** In the borrowed token */
    equity: maybes([position, oraclePrice], getEquity),
  }
}

export type MarketStats = ReturnType<typeof normalizeMarketStats>

type UserPositionQueries = {
  stats: QueryProp<MarketStats>
  prices: { borrowed: QueryProp<TokenPrice>; collateral: QueryProp<TokenPrice> }
  /** Equity in USD, at the borrowed token's USD rate */
  equityUsd: QueryProp<number>
  pnl: QueryProp<PositionPnlAndRoi>
  /** PNL in the debt token, in USD at the borrowed token's USD rate */
  pnlUsd: QueryProp<number>
  /** The open position borrowed through the leverage zap */
  isZapLeveraged: QueryProp<boolean>
  /** The leverage the open position opened at */
  openingLeverage: QueryProp<Decimal | null>
}

const EMPTY_POSITION_QUERIES: UserPositionQueries = {
  stats: DISABLED_Q,
  prices: { borrowed: DISABLED_Q, collateral: DISABLED_Q },
  equityUsd: DISABLED_Q,
  pnl: DISABLED_Q,
  pnlUsd: DISABLED_Q,
  isZapLeveraged: DISABLED_Q,
  openingLeverage: DISABLED_Q,
}

/** Internal market-list row shape; API market data remains free of view/query state. */
export type LlamaMarketRow = LlamaMarket & { positionQueries: UserPositionQueries }
export type LlamaMarketsTableResult = Omit<LlamaMarketsResult, 'markets'> & { markets: LlamaMarketRow[] }

const createStatsEntries = (markets: LlamaMarket[], userAddress: Address | undefined) =>
  markets
    .filter(({ userHasPositions }) => userHasPositions?.Borrow)
    .map(market => ({
      market,
      options:
        market.type === MarketType.Lend
          ? getUserLendingVaultStatsOptions({
              contractAddress: market.controllerAddress,
              userAddress,
              blockchainId: market.blockchainId,
            })
          : getUserMintMarketsStatsOptions({
              contractAddress: market.controllerAddress,
              userAddress,
              blockchainId: market.blockchainId,
            }),
    }))

const createTokenPriceEntries = (markets: LlamaMarket[]) =>
  uniqBy(
    markets.flatMap(({ assets, blockchainId: chain, userHasPositions }) => {
      if (!userHasPositions) return []
      const borrowed = { chainId: requireChainId(chain), tokenAddress: assets.borrowed.address }
      const collateral = { chainId: requireChainId(chain), tokenAddress: assets.collateral.address }
      return userHasPositions.Borrow ? [borrowed, collateral] : [borrowed]
    }),
    getTokenPriceKey,
  )

/**
 * Resolves all position data once at the market-list boundary.
 *
 * The summary, table cells, and TanStack accessors consume the same query results. Rebuilding the enriched row array
 * as queries resolve invalidates TanStack's row value cache so asynchronously loaded values are re-sorted.
 */
export const useLlamaMarketRows = (markets: LlamaMarket[], userAddress: Address | undefined): LlamaMarketRow[] => {
  const statsEntries = useMemo(() => createStatsEntries(markets, userAddress), [markets, userAddress])
  const tokenPriceEntries = useMemo(() => createTokenPriceEntries(markets), [markets])

  const statsQueries = useQueries({
    queries: useMemo(() => statsEntries.map(({ options }) => options), [statsEntries]),
    combine: results => results.map(result => q<BorrowStats>(result)),
  })
  const isPositionPnlEnabled = useLlamalendPositionPnl()
  // The prices API reports V0 zap leverage as plain borrows and repays, so their events can't give the position's capital
  const eventsEntries = statsEntries.filter(
    ({ market }) => !isZapV0MintMarket(market.blockchainId, market.controllerAddress),
  )
  const eventsQueries = useQueries({
    queries: eventsEntries.map(({ market: { type, controllerAddress, blockchainId } }) =>
      getPositionEventsSummaryOptions(
        type,
        { contractAddress: controllerAddress, userAddress, blockchainId },
        isPositionPnlEnabled,
      ),
    ),
    combine: results => results.map(q),
  })
  const tokenPriceQueries = useQueries({
    queries: useMemo(() => tokenPriceEntries.map(params => getTokenUsdRateQueryOptions(params)), [tokenPriceEntries]),
    combine: results => results.map(q),
  })

  return useMemo(() => {
    const statsByMarket = new Map(statsEntries.map(({ market }, index) => [market, statsQueries[index]]))
    const eventsByMarket = new Map(eventsEntries.map(({ market }, index) => [market, eventsQueries[index]]))
    const pricesByToken = new Map(
      tokenPriceEntries.map((entry, index) => [getTokenPriceKey(entry), tokenPriceQueries[index]]),
    )

    const getPriceQuery = (blockchainId: Chain, tokenAddress: Address) =>
      pricesByToken.get(getTokenPriceKey({ chainId: requireChainId(blockchainId), tokenAddress })) ?? DISABLED_Q

    return markets.map(market => {
      if (!market.userHasPositions) return { ...market, positionQueries: EMPTY_POSITION_QUERIES }

      const stats = mapQuery(statsByMarket.get(market) ?? DISABLED_Q, normalizeMarketStats)
      const prices = {
        borrowed: getPriceQuery(market.blockchainId, market.assets.borrowed.address),
        collateral: getPriceQuery(market.blockchainId, market.assets.collateral.address),
      }
      const events = eventsByMarket.get(market) ?? DISABLED_Q
      const pnl = combineQueries(
        [stats, mapQuery(events, ({ capital }) => capital)],
        ({ equity, oraclePrice }, capital) =>
          maybes([equity, oraclePrice], (equity, oraclePrice) =>
            getPositionPnlAndRoi({ equity, oraclePrice, capital }),
          ),
      )
      return {
        ...market,
        positionQueries: {
          stats,
          prices,
          equityUsd: combineQueries([stats, prices.borrowed], ({ equity }, rate) =>
            maybe(equity, equity => Number(equity) * rate),
          ),
          pnl,
          pnlUsd: combineQueries([pnl, prices.borrowed], (pnl, rate) =>
            maybe(pnl, ({ debt }) => Number(debt.pnl) * rate),
          ),
          isZapLeveraged: mapQuery(events, ({ isZapLeveraged }) => isZapLeveraged),
          openingLeverage: mapQuery(events, ({ openingLeverage }) => openingLeverage),
        },
      }
    })
  }, [markets, statsEntries, statsQueries, eventsEntries, eventsQueries, tokenPriceEntries, tokenPriceQueries])
}
