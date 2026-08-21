import { uniqBy } from 'lodash'
import { useMemo } from 'react'
import { getDisplayHealth, getLiquidationStatus, isBelowRange } from '@/llamalend/llama.utils'
import { getUserLendingVaultStatsOptions } from '@/llamalend/queries/market-list/lending-vaults'
import type { LlamaMarket, LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import { getUserMintMarketsStatsOptions } from '@/llamalend/queries/market-list/mint-markets'
import type { Chain } from '@curvefi/prices-api'
import { getTokenUsdRateQueryOptions } from '@evm-ui/lib/model/entities/token-usd-rate'
import type { QueryOptionsData } from '@evm-ui/lib/queries/types'
import { MarketType } from '@evm-ui/types/market'
import { DISABLED_Q, mapQuery, q, type QueryProp } from '@evm-ui/types/util'
import { decimal, requireChainId } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import { useQueries } from '@tanstack/react-query'

type LendBorrowStats = QueryOptionsData<ReturnType<typeof getUserLendingVaultStatsOptions>>
type MintBorrowStats = QueryOptionsData<ReturnType<typeof getUserMintMarketsStatsOptions>>
type BorrowStats = LendBorrowStats | MintBorrowStats
type TokenPrice = number

type TokenPriceEntry = {
  chainId: number
  tokenAddress: Address
}

const getTokenPriceKey = ({ chainId, tokenAddress }: TokenPriceEntry) => `${chainId}:${tokenAddress.toLowerCase()}`

const normalizeMarketStats = (stats: BorrowStats) => {
  const collateralBorrowTokenAmount = 'stablecoin' in stats ? stats.stablecoin : stats.borrowed
  return {
    status: getLiquidationStatus(
      decimal(stats.health),
      stats.softLiquidation,
      isBelowRange(stats.activeBand, stats.n2),
      decimal(stats.collateral),
      decimal(collateralBorrowTokenAmount),
    ),
    health: getDisplayHealth(stats.healthFull, stats.health) ?? undefined,
    borrowed: stats.debt,
    collateral: stats.collateral,
    /**
     * During soft liquidation part of the deposited collateral is converted into the borrow token.
     */
    borrowToken: collateralBorrowTokenAmount,
  }
}

export type MarketStats = ReturnType<typeof normalizeMarketStats>

type UserPositionQueries = {
  stats: QueryProp<MarketStats>
  prices: {
    borrowed: QueryProp<TokenPrice>
    collateral: QueryProp<TokenPrice>
  }
}

const EMPTY_POSITION_QUERIES: UserPositionQueries = {
  stats: DISABLED_Q,
  prices: {
    borrowed: DISABLED_Q,
    collateral: DISABLED_Q,
  },
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
              blockchainId: market.chain,
            })
          : getUserMintMarketsStatsOptions({
              contractAddress: market.controllerAddress,
              userAddress,
              blockchainId: market.chain,
            }),
    }))

const createTokenPriceEntries = (markets: LlamaMarket[]) =>
  uniqBy(
    markets.flatMap(({ assets, chain, userHasPositions }) => {
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
  const tokenPriceQueries = useQueries({
    queries: useMemo(() => tokenPriceEntries.map(params => getTokenUsdRateQueryOptions(params)), [tokenPriceEntries]),
    combine: results => results.map(result => q<TokenPrice>(result)),
  })

  return useMemo(() => {
    const statsByMarket = new Map(statsEntries.map(({ market }, index) => [market, statsQueries[index]]))
    const pricesByToken = new Map(
      tokenPriceEntries.map((entry, index) => [getTokenPriceKey(entry), tokenPriceQueries[index]]),
    )

    const getPriceQuery = (chain: Chain, tokenAddress: Address) =>
      pricesByToken.get(getTokenPriceKey({ chainId: requireChainId(chain), tokenAddress })) ?? DISABLED_Q

    return markets.map(market => {
      if (!market.userHasPositions) return { ...market, positionQueries: EMPTY_POSITION_QUERIES }

      return {
        ...market,
        positionQueries: {
          stats: mapQuery(statsByMarket.get(market) ?? DISABLED_Q, normalizeMarketStats),
          prices: {
            borrowed: getPriceQuery(market.chain, market.assets.borrowed.address),
            collateral: getPriceQuery(market.chain, market.assets.collateral.address),
          },
        },
      }
    })
  }, [markets, statsEntries, statsQueries, tokenPriceEntries, tokenPriceQueries])
}
