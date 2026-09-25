import { uniqBy } from 'lodash'
import { useMemo } from 'react'
import { getAddress } from 'viem'
import { getDisplayHealth, getLiquidationStatus, isBelowRange } from '@/llamalend/llama.utils'
import { getMarketOraclePriceOptions } from '@/llamalend/queries/market/market-oracle-price.query'
import { getUserLendingVaultStatsOptions } from '@/llamalend/queries/market-list/lending-vaults'
import type { LlamaMarket, LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import { getUserMintMarketsStatsOptions } from '@/llamalend/queries/market-list/mint-markets'
import { getLendMarketCatalogOptions, getMintMarketCatalogOptions } from '@/llamalend/queries/market-list/sdk-market-catalog'
import { getUserHealthOptions } from '@/llamalend/queries/user/user-health.query'
import { getUserPricesOptions } from '@/llamalend/queries/user/user-prices.query'
import type { Chain } from '@curvefi/prices-api'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { getTokenUsdRateQueryOptions } from '@evm-ui/queries/token-usd-rate.query'
import { MarketType } from '@evm-ui/types/market'
import { requireChainId } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { useQueries } from '@tanstack/react-query'
import { DISABLED_Q, mapQuery, q, type QueryOptionsData, type QueryProp, type Range } from '@ui/features/queries/util'
import { decimal } from '@ui/lib/decimal'

type LendBorrowStats = QueryOptionsData<ReturnType<typeof getUserLendingVaultStatsOptions>>
type MintBorrowStats = QueryOptionsData<ReturnType<typeof getUserMintMarketsStatsOptions>>
type BorrowStats = LendBorrowStats | MintBorrowStats
type TokenPrice = number

type TokenPriceEntry = { chainId: number; tokenAddress: Address }

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
    /** Raw Controller full health in percentage points. Distinct from the display health above. */
    healthFull: stats.healthFull,
    oraclePrice: stats.oraclePrice,
    borrowed: stats.debt,
    collateral: stats.collateral,
    /**
     * During soft liquidation part of the deposited collateral is converted into the borrow token.
     */
    borrowToken: collateralBorrowTokenAmount,
  }
}

export type MarketStats = ReturnType<typeof normalizeMarketStats>

/** Same reads as the position card: oracle, user range, and Controller health(full). */
export type PositionRiskQueries = {
  oracle: QueryProp<Decimal>
  /** SDK order: index 0 is the lower boundary, index 1 is the upper boundary. */
  prices: QueryProp<Range<Decimal> | null>
  fullHealth: QueryProp<Decimal>
  /** True while the beta health column is active, including before the catalog id resolves. */
  beta: boolean
}

type UserPositionQueries = {
  stats: QueryProp<MarketStats>
  prices: { borrowed: QueryProp<TokenPrice>; collateral: QueryProp<TokenPrice> }
  risk: PositionRiskQueries
}

const EMPTY_RISK: PositionRiskQueries = { oracle: DISABLED_Q, prices: DISABLED_Q, fullHealth: DISABLED_Q, beta: false }

const EMPTY_POSITION_QUERIES: UserPositionQueries = {
  stats: DISABLED_Q,
  prices: { borrowed: DISABLED_Q, collateral: DISABLED_Q },
  risk: EMPTY_RISK,
}

const sameAddress = (left: string | undefined, right: string) => {
  if (!left) return false
  try {
    return getAddress(left) === getAddress(right)
  } catch {
    return false
  }
}

/** The market page looks the SDK registry up by the route key: lend uses the controller, mint uses the market name. */
const registryKey = (market: LlamaMarket) => decodeURIComponent(market.url.split('/').at(-1) ?? '')

const controllerMarketId = (catalog: Record<string, { id?: string; addresses?: { controller?: string; amm?: string }; controller_address?: string; amm_address?: string }> | undefined, market: LlamaMarket) => {
  if (!catalog) return undefined
  const routeKey = registryKey(market)
  const direct = catalog[routeKey]
  if (direct?.id) return direct.id
  const controller = market.controllerAddress
  for (const [key, entry] of Object.entries(catalog)) {
    const matched =
      key === routeKey ||
      sameAddress(key, controller) ||
      sameAddress(entry.addresses?.controller, controller) ||
      sameAddress(entry.controller_address, controller) ||
      sameAddress(entry.addresses?.amm, market.ammAddress) ||
      sameAddress(entry.amm_address, market.ammAddress)
    if (matched && entry.id) return entry.id
  }
  return undefined
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
  const beta = useNewLlamalendHealth()
  const statsEntries = useMemo(() => createStatsEntries(markets, userAddress), [markets, userAddress])
  const tokenPriceEntries = useMemo(() => createTokenPriceEntries(markets), [markets])
  const borrowMarkets = useMemo(() => markets.filter(market => market.userHasPositions?.Borrow), [markets])
  const chainIds = useMemo(
    () => [...new Set(borrowMarkets.map(market => requireChainId(market.chain)))],
    [borrowMarkets],
  )

  const statsQueries = useQueries({
    queries: useMemo(() => statsEntries.map(({ options }) => options), [statsEntries]),
    combine: results => results.map(result => q<BorrowStats>(result)),
  })
  const tokenPriceQueries = useQueries({
    queries: useMemo(() => tokenPriceEntries.map(params => getTokenUsdRateQueryOptions(params)), [tokenPriceEntries]),
    combine: results => results.map(result => q<TokenPrice>(result)),
  })
  const catalogQueries = useQueries({
    queries: useMemo(
      () =>
        beta
          ? chainIds.flatMap(chainId => [getMintMarketCatalogOptions({ chainId }), getLendMarketCatalogOptions({ chainId })])
          : [],
      [beta, chainIds],
    ),
    combine: results => results.map(result => q<Record<string, { id: string }>>(result)),
  })
  const riskEntries = useMemo(() => {
    if (!beta || !userAddress) return []
    return borrowMarkets.map(market => {
      const chainId = requireChainId(market.chain)
      const catalogIndex = chainIds.indexOf(chainId)
      const catalog = (
        market.type === MarketType.Lend ? catalogQueries[catalogIndex * 2 + 1] : catalogQueries[catalogIndex * 2]
      )?.data
      const marketId = controllerMarketId(catalog, market)
      const params = { chainId, marketId: marketId ?? market.controllerAddress, userAddress }
      const enabled = marketId != null
      return {
        market,
        health: getUserHealthOptions({ ...params, isFull: true }, enabled),
        oracle: getMarketOraclePriceOptions(params, enabled),
        prices: getUserPricesOptions({ ...params, loanExists: true }, enabled),
      }
    })
  }, [beta, borrowMarkets, catalogQueries, chainIds, userAddress])
  const riskQueries = useQueries({
    queries: useMemo(() => riskEntries.flatMap(entry => [entry.health, entry.oracle, entry.prices]), [riskEntries]),
    combine: results => results.map(result => q(result)),
  })

  return useMemo(() => {
    const statsByMarket = new Map(statsEntries.map(({ market }, index) => [market, statsQueries[index]]))
    const pricesByToken = new Map(
      tokenPriceEntries.map((entry, index) => [getTokenPriceKey(entry), tokenPriceQueries[index]]),
    )
    const riskByMarket = new Map(
      riskEntries.map(({ market }, index) => [
        market,
        {
          fullHealth: riskQueries[index * 3] ?? DISABLED_Q,
          oracle: riskQueries[index * 3 + 1] ?? DISABLED_Q,
          prices: riskQueries[index * 3 + 2] ?? DISABLED_Q,
          beta: true,
        } satisfies PositionRiskQueries,
      ]),
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
          risk: { ...(riskByMarket.get(market) ?? EMPTY_RISK), beta },
        },
      }
    })
  }, [beta, markets, riskEntries, riskQueries, statsEntries, statsQueries, tokenPriceEntries, tokenPriceQueries])
}
