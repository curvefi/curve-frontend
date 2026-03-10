import { partition, sum, uniqBy } from 'lodash'
import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import {
  getUserLendingVaultEarningsOptions,
  getUserLendingVaultStatsOptions,
} from '@/llamalend/queries/market-list/lending-vaults'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { getUserMintMarketsStatsOptions } from '@/llamalend/queries/market-list/mint-markets'
import type { Address } from '@primitives/address.utils'
import { splitAt } from '@primitives/array.utils'
import { notFalsy } from '@primitives/objects.utils'
import { useQueries, type UseQueryResult } from '@tanstack/react-query'
import { t } from '@ui-kit/lib/i18n'
import { getTokenUsdRateQueryOptions } from '@ui-kit/lib/model/entities/token-usd-rate'
import { combineQueriesMeta } from '@ui-kit/lib/queries/combine'
import { type QueryOptionsData } from '@ui-kit/lib/queries/types'
import { LlamaMarketType } from '@ui-kit/types/market'
import { requireChainId } from '@ui-kit/utils'

export type UserPositionSummaryMetric = { label: string; data: number; isLoading: boolean; error?: unknown }

type StatsQueryOptions =
  | ReturnType<typeof getUserLendingVaultStatsOptions>
  | ReturnType<typeof getUserMintMarketsStatsOptions>
type EarningsQueryOptions = ReturnType<typeof getUserLendingVaultEarningsOptions>

type LendBorrowStatsData = QueryOptionsData<ReturnType<typeof getUserLendingVaultStatsOptions>>
type MintBorrowStatsData = QueryOptionsData<ReturnType<typeof getUserMintMarketsStatsOptions>>
type BorrowStatsData = LendBorrowStatsData | MintBorrowStatsData
type SupplyStatsData = QueryOptionsData<EarningsQueryOptions>
type TokenPriceData = QueryOptionsData<ReturnType<typeof getTokenUsdRateQueryOptions>>

type BorrowPositionQuery = {
  query: StatsQueryOptions
  blockchainId: LlamaMarket['chain']
  debtTokenAddress: Address
  collateralTokenAddress: Address
  marketType: LlamaMarketType
}

type SupplyPositionQuery = {
  query: EarningsQueryOptions
  blockchainId: LlamaMarket['chain']
  suppliedTokenAddress: Address
}

type TokenPriceEntry = { chainId: number; tokenAddress: Address }

type PositionQueryEntry =
  | { kind: 'borrow'; value: BorrowPositionQuery }
  | { kind: 'supply'; value: SupplyPositionQuery }

const MISSING_PRICE_RESULT: TokenPriceData = 0

const createMetric = (label: string, data: number, isLoading: boolean, error?: unknown): UserPositionSummaryMetric => ({
  label,
  data,
  isLoading,
  error,
})

const getSupplyEntry = (market: LlamaMarket, userAddress: Address | undefined): PositionQueryEntry | null => {
  if (!market.userHasPositions?.Supply || !market.vaultAddress) return null

  return {
    kind: 'supply',
    value: {
      query: getUserLendingVaultEarningsOptions({
        contractAddress: market.vaultAddress,
        userAddress,
        blockchainId: market.chain,
      }),
      blockchainId: market.chain,
      suppliedTokenAddress: market.assets.borrowed.address,
    },
  }
}

const getBorrowEntry = (market: LlamaMarket, userAddress: Address | undefined): PositionQueryEntry | null => {
  if (!market.userHasPositions?.Borrow) return null

  return {
    kind: 'borrow',
    value: {
      query:
        market.type === LlamaMarketType.Lend
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
      blockchainId: market.chain,
      debtTokenAddress: market.assets.borrowed.address,
      collateralTokenAddress: market.assets.collateral.address,
      marketType: market.type,
    },
  }
}

/** Deduplicate token price lookup entries by chain and address. */
const collectTokenEntries = <T,>(items: T[], getEntries: (item: T) => TokenPriceEntry[]) =>
  uniqBy(items.flatMap(getEntries), (entry) => `${entry.chainId}:${entry.tokenAddress.toLowerCase()}`)

const createTokenPriceQueries = (entries: TokenPriceEntry[]) =>
  entries.map(({ chainId, tokenAddress }) => getTokenUsdRateQueryOptions({ chainId, tokenAddress }))

/** Build a token price lookup that hides key formatting. */
const buildGetPrice = (entries: TokenPriceEntry[], priceResults: UseQueryResult<TokenPriceData>[]) => {
  const getKey = (chainId: number, address: Address) => `${chainId}:${address.toLowerCase()}`
  const tokenMap = Object.fromEntries(
    entries.map(({ chainId, tokenAddress }, index) => [getKey(chainId, tokenAddress), priceResults[index]?.data]),
  ) as Record<string, TokenPriceData | undefined>

  return (chainId: number, address: Address) => tokenMap[getKey(chainId, address)] ?? MISSING_PRICE_RESULT
}

const isMintMarketStats = (stats: BorrowStatsData | undefined) => stats && 'stablecoin' in stats

/** Get the amount of borrowed tokens when in soft liquidation.
 * If mint market, return the .stablecoin, if lend market, return the .borrowed */
const getSoftLiquidationBorrowedAmount = (marketType: LlamaMarketType, stats: BorrowStatsData | undefined) =>
  marketType === LlamaMarketType.Mint && isMintMarketStats(stats)
    ? ((stats as MintBorrowStatsData)?.stablecoin ?? MISSING_PRICE_RESULT)
    : marketType === LlamaMarketType.Lend && !isMintMarketStats(stats)
      ? ((stats as LendBorrowStatsData)?.borrowed ?? MISSING_PRICE_RESULT)
      : MISSING_PRICE_RESULT

/**
 * Summarize user positions into USD totals combining position and price queries together.
 * It separates the borrow/supply query sets, fetches token prices and positions, and aggregates totals.
 * Loading/error states of prices and positions are combined.
 */
export const useUserPositionsSummary = ({
  markets,
}: {
  markets: LlamaMarket[] | undefined
}): UserPositionSummaryMetric[] => {
  const { address: userAddress } = useConnection()

  const userPositionQueries = useMemo(() => {
    if (!markets) return { borrow: [], supply: [] }

    const positionEntries = markets.flatMap((market) => {
      const isSupply = market.userHasPositions?.Supply
      if (!market.userHasPositions || (isSupply && !market.vaultAddress)) return []

      return notFalsy<PositionQueryEntry>(getSupplyEntry(market, userAddress), getBorrowEntry(market, userAddress))
    })

    const [borrow, supply] = partition(positionEntries, (entry) => entry.kind === 'borrow').map((entries) =>
      entries.map((entry) => entry.value),
    ) as [BorrowPositionQuery[], SupplyPositionQuery[]]

    return { borrow, supply }
  }, [markets, userAddress])

  // Collect unique token contract addresses to price positions in USD.
  const tokenPriceEntries = useMemo(
    () => ({
      borrow: collectTokenEntries(
        userPositionQueries.borrow,
        ({ blockchainId, debtTokenAddress, collateralTokenAddress }) => [
          { chainId: requireChainId(blockchainId), tokenAddress: debtTokenAddress },
          { chainId: requireChainId(blockchainId), tokenAddress: collateralTokenAddress },
        ],
      ),
      supply: collectTokenEntries(userPositionQueries.supply, ({ blockchainId, suppliedTokenAddress }) => [
        { chainId: requireChainId(blockchainId), tokenAddress: suppliedTokenAddress },
      ]),
    }),
    [userPositionQueries],
  )

  /** Keep price queries in the same useQueries call as position queries and derive totals in combine.
   * This avoids useMemo deps on proxy query results. */
  const borrowSummary = useQueries({
    queries: [
      ...userPositionQueries.borrow.map(({ query }) => query),
      ...createTokenPriceQueries(tokenPriceEntries.borrow),
    ],
    combine: (results) => {
      const [positionResults, priceResults] = splitAt(results, userPositionQueries.borrow.length) as [
        UseQueryResult<BorrowStatsData>[],
        UseQueryResult<TokenPriceData>[],
      ]

      const getPrice = buildGetPrice(tokenPriceEntries.borrow, priceResults)

      // Missing USD prices contribute 0 and surface as summary errors.
      const totalCollateralValue = sum(
        positionResults.map((stat, index) => {
          const borrowMeta = userPositionQueries.borrow[index]
          const chainId = requireChainId(borrowMeta.blockchainId)
          const collateralTokenPrice = getPrice(chainId, borrowMeta.collateralTokenAddress)
          const borrowedTokenPrice = getPrice(chainId, borrowMeta.debtTokenAddress)

          const collateralValue = (stat.data?.collateral ?? 0) * collateralTokenPrice
          // part of the collateral is converted in the borrowed token when in soft liquidation
          const borrowedAmount = getSoftLiquidationBorrowedAmount(borrowMeta.marketType, stat.data)
          const borrowedValue = borrowedAmount * borrowedTokenPrice

          return collateralValue + borrowedValue
        }),
      )

      const totalBorrowedValue = sum(
        positionResults.map((stat, index) => {
          const borrowMeta = userPositionQueries.borrow[index]
          const chainId = requireChainId(borrowMeta.blockchainId)
          const debtPrice = getPrice(chainId, borrowMeta.debtTokenAddress)

          return (stat.data?.debt ?? 0) * debtPrice
        }),
      )
      const data = {
        totalCollateralValue,
        totalBorrowedValue,
      }

      return { ...combineQueriesMeta(results), data }
    },
  })

  /** Keep price queries in the same useQueries call as position queries and derive totals in combine.
   * This avoids useMemo deps on proxy query results. */
  const supplySummary = useQueries({
    queries: [
      ...userPositionQueries.supply.map(({ query }) => query),
      ...createTokenPriceQueries(tokenPriceEntries.supply),
    ],
    combine: (results) => {
      const [positionResults, priceResults] = splitAt(results, userPositionQueries.supply.length) as [
        UseQueryResult<SupplyStatsData>[],
        UseQueryResult<TokenPriceData>[],
      ]

      const getPrice = buildGetPrice(tokenPriceEntries.supply, priceResults)

      // Missing USD prices contribute 0 and surface as summary errors.
      const totalSuppliedValue = sum(
        positionResults.map((stat, index) => {
          const supplyMeta = userPositionQueries.supply[index]
          const chainId = requireChainId(supplyMeta.blockchainId)
          const suppliedPrice = getPrice(chainId, supplyMeta.suppliedTokenAddress)

          return (stat.data?.totalCurrentAssets ?? 0) * suppliedPrice
        }),
      )
      const data = {
        totalSuppliedValue,
      }

      return { ...combineQueriesMeta(results), data }
    },
  })

  return [
    createMetric(
      t`Total Collateral`,
      borrowSummary.data.totalCollateralValue,
      borrowSummary.isLoading,
      borrowSummary.error,
    ),
    createMetric(
      t`Total Borrowed`,
      borrowSummary.data.totalBorrowedValue,
      borrowSummary.isLoading,
      borrowSummary.error,
    ),
    createMetric(
      t`Total Supplied`,
      supplySummary.data.totalSuppliedValue,
      supplySummary.isLoading,
      supplySummary.error,
    ),
  ]
}
