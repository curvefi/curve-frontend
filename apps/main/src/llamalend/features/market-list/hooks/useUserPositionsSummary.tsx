import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import {
  getUserLendingVaultEarningsOptions,
  getUserLendingVaultStatsOptions,
} from '@/llamalend/queries/market-list/lending-vaults'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { getUserMintMarketsStatsOptions } from '@/llamalend/queries/market-list/mint-markets'
import { useQueries } from '@tanstack/react-query'
import { getTokenUsdPriceQueryOptions } from '@ui-kit/lib/model/entities/token-usd-prices'
import { combineQueriesMeta } from '@ui-kit/lib/queries/combine'
import { LlamaMarketType } from '@ui-kit/types/market'
import { type Address } from '@ui-kit/utils'

type StatsQueryOptions =
  | ReturnType<typeof getUserLendingVaultStatsOptions>
  | ReturnType<typeof getUserMintMarketsStatsOptions>
type EarningsQueryOptions = ReturnType<typeof getUserLendingVaultEarningsOptions>

type BorrowPositionQuery = {
  query: StatsQueryOptions
  chainId: LlamaMarket['chain']
  debtTokenKey: string
  debtTokenAddress: Address
  collateralTokenKey: string
  collateralTokenAddress: Address
}

type SupplyPositionQuery = {
  query: EarningsQueryOptions
  chainId: LlamaMarket['chain']
  suppliedTokenKey: string
  suppliedTokenAddress: Address
}

export type UserPositionSummaryMetric = { label: string; data: number; isLoading: boolean; isError: boolean }

const MISSING_PRICE_RESULT = { data: 0, isLoading: false, isError: true }

const getTokenKey = (chainId: LlamaMarket['chain'], tokenAddress: Address) => `${chainId}:${tokenAddress.toLowerCase()}`

const createEmptyPositions = () => ({ borrow: [], supply: [] })

const createMetric = (
  label: string,
  data: number,
  isLoading: boolean,
  isError: boolean,
): UserPositionSummaryMetric => ({ label, data, isLoading, isError })

export const useUserPositionsSummary = ({
  markets,
}: {
  markets: LlamaMarket[] | undefined
}): UserPositionSummaryMetric[] => {
  const { address: userAddress } = useConnection()

  const userPositionOptions = useMemo(() => markets
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
              suppliedTokenKey: getTokenKey(market.chain, suppliedTokenAddress),
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
              debtTokenKey: getTokenKey(market.chain, debtTokenAddress),
              debtTokenAddress,
              collateralTokenKey: getTokenKey(market.chain, collateralTokenAddress),
              collateralTokenAddress,
            })
          }

          return options
        }, createEmptyPositions())
      : createEmptyPositions(), [markets, userAddress])

  // Collect unique token contract addresses to price positions in USD.
  const tokenPriceEntries = useMemo(() => {
    const entries = new Map<string, { chainId: LlamaMarket['chain']; contractAddress: Address }>()

    userPositionOptions.borrow.forEach(
      ({ chainId, debtTokenKey, debtTokenAddress, collateralTokenKey, collateralTokenAddress }) => {
        entries.set(debtTokenKey, { chainId, contractAddress: debtTokenAddress })
        entries.set(collateralTokenKey, { chainId, contractAddress: collateralTokenAddress })
      },
    )
    userPositionOptions.supply.forEach(({ chainId, suppliedTokenKey, suppliedTokenAddress }) => {
      entries.set(suppliedTokenKey, { chainId, contractAddress: suppliedTokenAddress })
    })
    return Array.from(entries, ([key, params]) => ({ key, ...params }))
  }, [userPositionOptions.borrow, userPositionOptions.supply])

  const tokenPriceQueries = useMemo(
    () =>
      tokenPriceEntries.map(({ chainId, contractAddress }) =>
        getTokenUsdPriceQueryOptions({ blockchainId: chainId, contractAddress }),
      ),
    [tokenPriceEntries],
  )

  const tokenPriceResults = useQueries({ queries: tokenPriceQueries })

  const tokenPriceResultsByKey = useMemo(
    () =>
      tokenPriceEntries.reduce(
        (acc, entry, index) => {
          acc[entry.key] = tokenPriceResults[index]
          return acc
        },
        {} as Record<string, (typeof tokenPriceResults)[number] | undefined>,
      ),
    [tokenPriceEntries, tokenPriceResults],
  )

  const borrowResults = useQueries({ queries: userPositionOptions.borrow.map(({ query }) => query) })
  const supplyResults = useQueries({ queries: userPositionOptions.supply.map(({ query }) => query) })

  const borrowSummary = useMemo(() => {
    const meta = combineQueriesMeta(borrowResults)
    const data = borrowResults.reduce(
      (acc, stat, index) => {
        const borrowMeta = userPositionOptions.borrow[index]
        if (!borrowMeta) return acc

        const collateralPrice = tokenPriceResultsByKey[borrowMeta.collateralTokenKey] ?? MISSING_PRICE_RESULT
        const debtPrice = tokenPriceResultsByKey[borrowMeta.debtTokenKey] ?? MISSING_PRICE_RESULT

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

    return {
      totalCollateralValue: data.totalCollateralValue,
      totalBorrowedValue: data.totalBorrowedValue,
      isLoading: meta.isLoading || data.isLoading,
      isError: meta.isError || data.isError,
    }
  }, [borrowResults, tokenPriceResultsByKey, userPositionOptions.borrow])

  const supplySummary = useMemo(() => {
    const meta = combineQueriesMeta(supplyResults)
    const data = supplyResults.reduce(
      (acc, stat, index) => {
        const supplyMeta = userPositionOptions.supply[index]
        if (!supplyMeta) return acc

        const suppliedPrice = tokenPriceResultsByKey[supplyMeta.suppliedTokenKey] ?? MISSING_PRICE_RESULT

        return {
          // Missing USD prices contribute 0 and surface as summary errors.
          totalSuppliedValue: acc.totalSuppliedValue + (stat.data?.totalCurrentAssets ?? 0) * (suppliedPrice.data ?? 0),
          isLoading: acc.isLoading || suppliedPrice.isLoading,
          isError: acc.isError || suppliedPrice.isError,
        }
      },
      { totalSuppliedValue: 0, isLoading: false, isError: false },
    )

    return {
      totalSuppliedValue: data.totalSuppliedValue,
      isLoading: meta.isLoading || data.isLoading,
      isError: meta.isError || data.isError,
    }
  }, [supplyResults, tokenPriceResultsByKey, userPositionOptions.supply])

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
