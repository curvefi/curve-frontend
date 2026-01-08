import { useMemo } from 'react'
import { partition, sum, uniqBy } from 'lodash'
import { useConnection } from 'wagmi'
import {
  getUserLendingVaultEarningsOptions,
  getUserLendingVaultStatsOptions,
} from '@/llamalend/queries/market-list/lending-vaults'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { getUserMintMarketsStatsOptions } from '@/llamalend/queries/market-list/mint-markets'
import { useQueries, type UseQueryResult } from '@tanstack/react-query'
import { getTokenUsdPriceQueryOptions } from '@ui-kit/lib/model/entities/token-usd-prices'
import { combineQueriesMeta } from '@ui-kit/lib/queries/combine'
import { type QueryOptionsData } from '@ui-kit/lib/queries/types'
import { LlamaMarketType } from '@ui-kit/types/market'
import { type Address } from '@ui-kit/utils'

export type UserPositionSummaryMetric = { label: string; data: number; isLoading: boolean; error?: unknown }

type StatsQueryOptions =
  | ReturnType<typeof getUserLendingVaultStatsOptions>
  | ReturnType<typeof getUserMintMarketsStatsOptions>
type EarningsQueryOptions = ReturnType<typeof getUserLendingVaultEarningsOptions>

type BorrowStatsData = QueryOptionsData<StatsQueryOptions>
type SupplyStatsData = QueryOptionsData<EarningsQueryOptions>
type TokenPriceData = QueryOptionsData<ReturnType<typeof getTokenUsdPriceQueryOptions>>

type BorrowPositionQuery = {
  query: StatsQueryOptions
  chainId: LlamaMarket['chain']
  debtTokenAddress: Address
  collateralTokenAddress: Address
}

type SupplyPositionQuery = {
  query: EarningsQueryOptions
  chainId: LlamaMarket['chain']
  suppliedTokenAddress: Address
}

type TokenPriceEntry = { key: string; chainId: LlamaMarket['chain']; contractAddress: Address }

type PositionQueryEntry =
  | { kind: 'borrow'; value: BorrowPositionQuery }
  | { kind: 'supply'; value: SupplyPositionQuery }

const MISSING_PRICE_RESULT: TokenPriceData = 0

const getTokenKey = (chainId: LlamaMarket['chain'], tokenAddress: Address) => `${chainId}:${tokenAddress.toLowerCase()}`

const createEmptyPositions = () => ({ borrow: [], supply: [] })

const createMetric = (label: string, data: number, isLoading: boolean, error?: unknown): UserPositionSummaryMetric => ({
  label,
  data,
  isLoading,
  error,
})

const collectTokenEntries = <T,>(items: T[], getEntries: (item: T) => TokenPriceEntry[]) =>
  uniqBy(items.map(getEntries).flat(), (entry) => entry.key)

const createTokenPriceQueries = (entries: TokenPriceEntry[]) =>
  entries.map(({ chainId, contractAddress }) =>
    getTokenUsdPriceQueryOptions({ blockchainId: chainId, contractAddress }),
  )

const splitQueryResults = <TData,>(results: UseQueryResult<unknown>[], positionCount: number) => ({
  positionResults: results.slice(0, positionCount) as UseQueryResult<TData>[],
  priceResults: results.slice(positionCount) as UseQueryResult<TokenPriceData>[],
})

const buildPriceByKey = (entries: TokenPriceEntry[], priceResults: UseQueryResult<TokenPriceData>[]) =>
  Object.fromEntries(entries.map((entry, index) => [entry.key, priceResults[index]?.data])) as Record<
    string,
    TokenPriceData | undefined
  >

const withQueryMeta = <T,>(results: UseQueryResult<unknown>[], data: T) => {
  const meta = combineQueriesMeta(results)
  return {
    ...data,
    isLoading: meta.isLoading,
    error: meta.isError,
  }
}

export const useUserPositionsSummary = ({
  markets,
}: {
  markets: LlamaMarket[] | undefined
}): UserPositionSummaryMetric[] => {
  const { address: userAddress } = useConnection()

  const userPositionQueries = useMemo(() => {
    if (!markets) return createEmptyPositions()

    const positionEntries = markets
      .map((market) => {
        const isSupply = market.userHasPositions?.Supply
        const isBorrow = market.userHasPositions?.Borrow
        if (!market.userHasPositions || (isSupply && !market.vaultAddress)) return []

        const queryParams = {
          userAddress,
          blockchainId: market.chain,
        }

        const entries: PositionQueryEntry[] = []

        if (isSupply && market.vaultAddress) {
          const suppliedTokenAddress = market.assets.borrowed.address
          entries.push({
            kind: 'supply',
            value: {
              query: getUserLendingVaultEarningsOptions({ contractAddress: market.vaultAddress, ...queryParams }),
              chainId: market.chain,
              suppliedTokenAddress,
            },
          })
        }

        if (isBorrow) {
          const debtTokenAddress = market.assets.borrowed.address
          const collateralTokenAddress = market.assets.collateral.address
          entries.push({
            kind: 'borrow',
            value: {
              query:
                market.type === LlamaMarketType.Lend
                  ? getUserLendingVaultStatsOptions({ contractAddress: market.controllerAddress, ...queryParams })
                  : getUserMintMarketsStatsOptions({ contractAddress: market.controllerAddress, ...queryParams }),
              chainId: market.chain,
              debtTokenAddress,
              collateralTokenAddress,
            },
          })
        }

        return entries
      })
      .flat()

    const [borrowEntries, supplyEntries] = partition(positionEntries, (entry) => entry.kind === 'borrow') as [
      Array<{ kind: 'borrow'; value: BorrowPositionQuery }>,
      Array<{ kind: 'supply'; value: SupplyPositionQuery }>,
    ]

    return {
      borrow: borrowEntries.map((entry) => entry.value),
      supply: supplyEntries.map((entry) => entry.value),
    }
  }, [markets, userAddress])

  // Collect unique token contract addresses to price positions in USD.
  const tokenPriceEntries = useMemo(
    () => ({
      borrow: collectTokenEntries(
        userPositionQueries.borrow,
        ({ chainId, debtTokenAddress, collateralTokenAddress }) => [
          { key: getTokenKey(chainId, debtTokenAddress), chainId, contractAddress: debtTokenAddress },
          { key: getTokenKey(chainId, collateralTokenAddress), chainId, contractAddress: collateralTokenAddress },
        ],
      ),
      supply: collectTokenEntries(userPositionQueries.supply, ({ chainId, suppliedTokenAddress }) => [
        { key: getTokenKey(chainId, suppliedTokenAddress), chainId, contractAddress: suppliedTokenAddress },
      ]),
    }),
    [userPositionQueries],
  )

  // Keep price queries in the same useQueries call as position queries and derive totals in combine.
  // This avoids useMemo deps on proxy query results.
  const borrowSummary = useQueries({
    queries: [
      ...userPositionQueries.borrow.map(({ query }) => query),
      ...createTokenPriceQueries(tokenPriceEntries.borrow),
    ],
    combine: (results) => {
      const { positionResults, priceResults } = splitQueryResults<BorrowStatsData>(
        results,
        userPositionQueries.borrow.length,
      )

      const priceByKey = buildPriceByKey(tokenPriceEntries.borrow, priceResults)

      // Missing USD prices contribute 0 and surface as summary errors.
      const totalCollateralValue = sum(
        positionResults.map((stat, index) => {
          const borrowMeta = userPositionQueries.borrow[index]
          if (!borrowMeta) return 0

          const collateralPrice =
            priceByKey[getTokenKey(borrowMeta.chainId, borrowMeta.collateralTokenAddress)] ?? MISSING_PRICE_RESULT

          return (stat.data?.collateral ?? 0) * collateralPrice
        }),
      )

      const totalBorrowedValue = sum(
        positionResults.map((stat, index) => {
          const borrowMeta = userPositionQueries.borrow[index]
          if (!borrowMeta) return 0

          const debtPrice =
            priceByKey[getTokenKey(borrowMeta.chainId, borrowMeta.debtTokenAddress)] ?? MISSING_PRICE_RESULT

          return (stat.data?.debt ?? 0) * debtPrice
        }),
      )

      const data = {
        totalCollateralValue,
        totalBorrowedValue,
      }

      return withQueryMeta(results, data)
    },
  })

  // Keep price queries in the same useQueries call and derive totals in combine.
  // This avoids useMemo deps on proxy results while still reacting to price/position updates.
  const supplySummary = useQueries({
    queries: [
      ...userPositionQueries.supply.map(({ query }) => query),
      ...createTokenPriceQueries(tokenPriceEntries.supply),
    ],
    combine: (results) => {
      const { positionResults, priceResults } = splitQueryResults<SupplyStatsData>(
        results,
        userPositionQueries.supply.length,
      )

      const priceByKey = buildPriceByKey(tokenPriceEntries.supply, priceResults)

      // Missing USD prices contribute 0 and surface as summary errors.
      const totalSuppliedValue = sum(
        positionResults.map((stat, index) => {
          const supplyMeta = userPositionQueries.supply[index]
          if (!supplyMeta) return 0

          const suppliedPrice =
            priceByKey[getTokenKey(supplyMeta.chainId, supplyMeta.suppliedTokenAddress)] ?? MISSING_PRICE_RESULT

          return (stat.data?.totalCurrentAssets ?? 0) * suppliedPrice
        }),
      )

      const data = {
        totalSuppliedValue,
      }

      return withQueryMeta(results, data)
    },
  })

  return [
    createMetric('Total Collateral', borrowSummary.totalCollateralValue, borrowSummary.isLoading, borrowSummary.error),
    createMetric('Total Borrowed', borrowSummary.totalBorrowedValue, borrowSummary.isLoading, borrowSummary.error),
    createMetric('Total Supplied', supplySummary.totalSuppliedValue, supplySummary.isLoading, supplySummary.error),
  ]
}
