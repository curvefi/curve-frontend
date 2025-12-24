import { useMemo } from 'react'
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

export type UserPositionSummaryMetric = { label: string; data: number; isLoading: boolean; isError: boolean }

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

type SummaryMeta = { isLoading: boolean; isError: boolean }

const MISSING_PRICE_RESULT = { data: 0, isLoading: false, isError: true }

const getTokenKey = (chainId: LlamaMarket['chain'], tokenAddress: Address) => `${chainId}:${tokenAddress.toLowerCase()}`

const createEmptyPositions = () => ({ borrow: [], supply: [] })

const createMetric = (
  label: string,
  data: number,
  isLoading: boolean,
  isError: boolean,
): UserPositionSummaryMetric => ({ label, data, isLoading, isError })

const collectTokenEntries = <T,>(items: T[], getEntries: (item: T) => TokenPriceEntry[]) => {
  const entries = new Map<string, TokenPriceEntry>()
  items.forEach((item) => {
    getEntries(item).forEach((entry) => {
      entries.set(entry.key, entry)
    })
  })
  return Array.from(entries.values())
}

const createTokenPriceQueries = (entries: TokenPriceEntry[]) =>
  entries.map(({ chainId, contractAddress }) =>
    getTokenUsdPriceQueryOptions({ blockchainId: chainId, contractAddress }),
  )

const splitQueryResults = <TData,>(results: UseQueryResult<unknown>[], positionCount: number) => ({
  positionResults: results.slice(0, positionCount) as UseQueryResult<TData>[],
  priceResults: results.slice(positionCount) as UseQueryResult<TokenPriceData>[],
})

const buildPriceByKey = (entries: TokenPriceEntry[], priceResults: UseQueryResult<TokenPriceData>[]) =>
  entries.reduce(
    (acc, entry, index) => {
      acc[entry.key] = priceResults[index]
      return acc
    },
    {} as Record<string, UseQueryResult<TokenPriceData> | undefined>,
  )

const withQueryMeta = <T extends SummaryMeta>(results: UseQueryResult<unknown>[], data: T) => {
  const meta = combineQueriesMeta(results)
  return {
    ...data,
    isLoading: meta.isLoading || data.isLoading,
    isError: meta.isError || data.isError,
  }
}

export const useUserPositionsSummary = ({
  markets,
}: {
  markets: LlamaMarket[] | undefined
}): UserPositionSummaryMetric[] => {
  const { address: userAddress } = useConnection()

  const userPositionQueries = useMemo(
    () =>
      markets
        ? markets.reduce<{ borrow: BorrowPositionQuery[]; supply: SupplyPositionQuery[] }>((options, market) => {
            const isSupply = market.userHasPositions?.Supply
            const isBorrow = market.userHasPositions?.Borrow
            if (!market.userHasPositions || (isSupply && !market.vaultAddress)) return options

            const queryParams = {
              userAddress,
              blockchainId: market.chain,
            }

            if (isSupply && market.vaultAddress) {
              const suppliedTokenAddress = market.assets.borrowed.address
              options.supply.push({
                query: getUserLendingVaultEarningsOptions({ contractAddress: market.vaultAddress, ...queryParams }),
                chainId: market.chain,
                suppliedTokenAddress,
              })
            }

            if (isBorrow) {
              const debtTokenAddress = market.assets.borrowed.address
              const collateralTokenAddress = market.assets.collateral.address
              options.borrow.push({
                query:
                  market.type === LlamaMarketType.Lend
                    ? getUserLendingVaultStatsOptions({ contractAddress: market.controllerAddress, ...queryParams })
                    : getUserMintMarketsStatsOptions({ contractAddress: market.controllerAddress, ...queryParams }),
                chainId: market.chain,
                debtTokenAddress,
                collateralTokenAddress,
              })
            }

            return options
          }, createEmptyPositions())
        : createEmptyPositions(),
    [markets, userAddress],
  )

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

      const data = positionResults.reduce(
        (acc, stat, index) => {
          const borrowMeta = userPositionQueries.borrow[index]
          if (!borrowMeta) return acc

          const collateralPrice =
            priceByKey[getTokenKey(borrowMeta.chainId, borrowMeta.collateralTokenAddress)] ?? MISSING_PRICE_RESULT
          const debtPrice =
            priceByKey[getTokenKey(borrowMeta.chainId, borrowMeta.debtTokenAddress)] ?? MISSING_PRICE_RESULT

          return {
            // Missing USD prices contribute 0 and surface as summary errors.
            totalCollateralValue: acc.totalCollateralValue + (stat.data?.collateral ?? 0) * (collateralPrice.data ?? 0),
            totalBorrowedValue: acc.totalBorrowedValue + (stat.data?.debt ?? 0) * (debtPrice.data ?? 0),
            isLoading: acc.isLoading || collateralPrice.isLoading || debtPrice.isLoading,
            isError: acc.isError || collateralPrice.isError || debtPrice.isError,
          }
        },
        { totalCollateralValue: 0, totalBorrowedValue: 0, isLoading: false, isError: false },
      )

      return withQueryMeta(positionResults, data)
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

      const data = positionResults.reduce(
        (acc, stat, index) => {
          const supplyMeta = userPositionQueries.supply[index]
          if (!supplyMeta) return acc

          const suppliedPrice =
            priceByKey[getTokenKey(supplyMeta.chainId, supplyMeta.suppliedTokenAddress)] ?? MISSING_PRICE_RESULT

          return {
            // Missing USD prices contribute 0 and surface as summary errors.
            totalSuppliedValue:
              acc.totalSuppliedValue + (stat.data?.totalCurrentAssets ?? 0) * (suppliedPrice.data ?? 0),
            isLoading: acc.isLoading || suppliedPrice.isLoading,
            isError: acc.isError || suppliedPrice.isError,
          }
        },
        { totalSuppliedValue: 0, isLoading: false, isError: false },
      )

      return withQueryMeta(positionResults, data)
    },
  })

  return [
    createMetric(
      'Total Collateral Value',
      borrowSummary.totalCollateralValue,
      borrowSummary.isLoading,
      borrowSummary.isError,
    ),
    createMetric('Total Borrowed', borrowSummary.totalBorrowedValue, borrowSummary.isLoading, borrowSummary.isError),
    createMetric('Total Supplied', supplySummary.totalSuppliedValue, supplySummary.isLoading, supplySummary.isError),
  ]
}
