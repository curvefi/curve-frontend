import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import {
  getUserLendingVaultEarningsOptions,
  getUserLendingVaultStatsOptions,
} from '@/llamalend/queries/market-list/lending-vaults'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { getUserMintMarketsStatsOptions } from '@/llamalend/queries/market-list/mint-markets'
import { useQueries } from '@tanstack/react-query'
import { combineQueriesMeta } from '@ui-kit/lib/queries/combine'
import { LlamaMarketType } from '@ui-kit/types/market'

type StatsQueryOptions =
  | ReturnType<typeof getUserLendingVaultStatsOptions>
  | ReturnType<typeof getUserMintMarketsStatsOptions>
type EarningsQueryOptions = ReturnType<typeof getUserLendingVaultEarningsOptions>

export type UserPositionSummaryMetric = { label: string; data: number; isLoading: boolean; isError: boolean }

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

  const userPositionOptions = useMemo(() => {
    if (!markets) return { borrow: [], supply: [] }

    return markets.reduce<{ borrow: StatsQueryOptions[]; supply: EarningsQueryOptions[] }>(
      (options, market) => {
        const isSupply = market.userHasPositions?.Supply
        const isBorrow = market.userHasPositions?.Borrow
        if (!market.userHasPositions || (isSupply && !market.vaultAddress)) return options

        const params = {
          userAddress,
          blockchainId: market.chain,
        }

        if (isSupply)
          options.supply.push(getUserLendingVaultEarningsOptions({ contractAddress: market.vaultAddress, ...params }))
        if (isBorrow)
          options.borrow.push(
            market.type === LlamaMarketType.Lend
              ? getUserLendingVaultStatsOptions({ contractAddress: market.controllerAddress, ...params })
              : getUserMintMarketsStatsOptions({ contractAddress: market.controllerAddress, ...params }),
          )

        return options
      },
      { borrow: [], supply: [] },
    )
  }, [markets, userAddress])

  const borrowSummary = useQueries({
    queries: userPositionOptions.borrow,
    combine: (results) => ({
      data: results.reduce(
        (acc, stat) => ({
          totalCollateralValue: acc.totalCollateralValue + (stat.data?.collateral ?? 0) * (stat.data?.oraclePrice ?? 0),
          // TODO: multiply by token price
          totalBorrowedValue: acc.totalBorrowedValue + (stat.data?.debt ?? 0),
        }),
        { totalCollateralValue: 0, totalBorrowedValue: 0 },
      ),
      ...combineQueriesMeta(results),
    }),
  })

  const supplySummary = useQueries({
    queries: userPositionOptions.supply,
    combine: (results) => ({
      data: results.reduce(
        (acc, stat) => ({
          // TODO: multiply by token price
          totalSuppliedValue: acc.totalSuppliedValue + (stat.data?.totalCurrentAssets ?? 0),
        }),
        { totalSuppliedValue: 0 },
      ),
      ...combineQueriesMeta(results),
    }),
  })

  return [
    createMetric(
      'Total Collateral Value',
      borrowSummary.data.totalCollateralValue,
      borrowSummary.isLoading,
      borrowSummary.isError,
    ),
    createMetric(
      'Total Borrowed',
      borrowSummary.data.totalBorrowedValue,
      borrowSummary.isLoading,
      borrowSummary.isError,
    ),
    createMetric(
      'Total Supplied',
      supplySummary.data.totalSuppliedValue,
      supplySummary.isLoading,
      supplySummary.isError,
    ),
  ]
}
