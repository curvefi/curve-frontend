import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { getUserLendingVaultStatsOptions } from '@/llamalend/queries/market-list/lending-vaults'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { getUserMintMarketsStatsOptions } from '@/llamalend/queries/market-list/mint-markets'
import { useQueries } from '@tanstack/react-query'
import { combineQueriesMeta } from '@ui-kit/lib/queries/combine'
import { LlamaMarketType } from '@ui-kit/types/market'

type QueryOptions =
  | ReturnType<typeof getUserLendingVaultStatsOptions>
  | ReturnType<typeof getUserMintMarketsStatsOptions>

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

  const userPositionStatsOptions = useMemo(() => {
    if (!markets) return []

    return markets.reduce<QueryOptions[]>((options, market) => {
      if (!market.userHasPositions?.Borrow) return options

      const params = {
        userAddress,
        contractAddress: market.controllerAddress,
        blockchainId: market.chain,
      }

      options.push(
        market.type === LlamaMarketType.Lend
          ? getUserLendingVaultStatsOptions(params)
          : getUserMintMarketsStatsOptions(params),
      )

      return options
    }, [])
  }, [markets, userAddress])

  const summary = useQueries({
    queries: userPositionStatsOptions,
    combine: (results) => ({
      data: results.reduce(
        (acc, stat) => ({
          totalCollateralValue: acc.totalCollateralValue + (stat.data?.collateral ?? 0) * (stat.data?.oraclePrice ?? 0),
          totalBorrowedValue: acc.totalBorrowedValue + (stat.data?.debt ?? 0),
        }),
        { totalCollateralValue: 0, totalBorrowedValue: 0 },
      ),
      ...combineQueriesMeta(results),
    }),
  })

  return [
    createMetric('Total Collateral Value', summary.data.totalCollateralValue, summary.isLoading, summary.isError),
    createMetric('Total Borrowed', summary.data.totalBorrowedValue, summary.isLoading, summary.isError),
  ]
}
