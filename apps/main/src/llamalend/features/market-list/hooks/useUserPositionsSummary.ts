import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import type { ContractParams } from '@ui-kit/lib/model'
import {
  getUserLendingVaultEarningsOptions,
  getUserLendingVaultStatsOptions,
} from '@/llamalend/entities/lending-vaults'
import { type LlamaMarket } from '@/llamalend/entities/llama-markets'
import { getUserMintMarketStatsOptions } from '@/llamalend/entities/mint-markets'
import { getTokenUsdPriceOptions } from '@/llamalend/entities/usd-prices'
import type { UserMarketStats as LendingUserMarketStats } from '@curvefi/prices-api/llamalend'
import type { UserMarketStats as MintUserMarketStats } from '@curvefi/prices-api/crvusd'
import { LlamaMarketType } from '@ui-kit/types/market'

type BorrowStats = LendingUserMarketStats | MintUserMarketStats

type Totals = {
  collateralValue: number
  borrowedValue: number
  suppliedValue: number
  rewardsValue: number
}

const ZERO_TOTALS: Totals = {
  collateralValue: 0,
  borrowedValue: 0,
  suppliedValue: 0,
  rewardsValue: 0,
}

type UseUserPositionsSummaryOptions = {
  enabled?: boolean
}

const getTokenKey = (
  blockchainId: ContractParams['blockchainId'],
  contractAddress: ContractParams['contractAddress'],
) => `${blockchainId}-${contractAddress?.toLowerCase() ?? ''}`

const getBorrowTokenAmount = (stats: BorrowStats | undefined) => {
  if (!stats) return 0
  return 'borrowed' in stats ? stats.borrowed : stats.stablecoin
}

export const useUserPositionsSummary = (
  markets: LlamaMarket[] | undefined,
  { enabled = true }: UseUserPositionsSummaryOptions = {},
) => {
  const { address: userAddress } = useAccount()
  const hasUser = Boolean(userAddress)
  const safeMarkets = markets ?? []

  const borrowMarkets = useMemo(() => safeMarkets.filter((market) => market.userHasPositions?.Borrow), [safeMarkets])
  const supplyMarkets = useMemo(() => safeMarkets.filter((market) => market.userHasPositions?.Supply), [safeMarkets])

  const shouldFetch = enabled && hasUser
  const tokenEntries = useMemo(() => {
    const seen = new Set<string>()
    const entries: [string, ContractParams][] = []
    const addToken = (params: ContractParams | undefined) => {
      if (!params?.contractAddress) return
      const key = getTokenKey(params.blockchainId, params.contractAddress)
      if (seen.has(key)) return
      seen.add(key)
      entries.push([key, params])
    }
    borrowMarkets.forEach((market) => {
      addToken({ blockchainId: market.chain, contractAddress: market.assets.collateral.address })
      addToken({ blockchainId: market.chain, contractAddress: market.assets.borrowed.address })
    })
    supplyMarkets.forEach((market) => {
      addToken({ blockchainId: market.chain, contractAddress: market.assets.borrowed.address })
    })
    return entries
  }, [borrowMarkets, supplyMarkets])

  const statsResults = useQueries({
    queries: borrowMarkets.map((market) => {
      const params = { userAddress, contractAddress: market.controllerAddress, blockchainId: market.chain }
      const statsOptions =
        market.type === LlamaMarketType.Lend
          ? getUserLendingVaultStatsOptions(params, shouldFetch)
          : getUserMintMarketStatsOptions(params, shouldFetch)
      return statsOptions
    }),
  })

  const earningsResults = useQueries({
    queries: supplyMarkets.map((market) =>
      getUserLendingVaultEarningsOptions(
        { userAddress, contractAddress: market.address, blockchainId: market.chain },
        shouldFetch,
      ),
    ),
  })

  const priceResults = useQueries({
    queries: tokenEntries.map(([, params]) => getTokenUsdPriceOptions(params, shouldFetch && tokenEntries.length > 0)),
  })

  const priceMap = useMemo(() => {
    const map = new Map<string, number>()
    priceResults.forEach((result, index) => {
      const key = tokenEntries[index]?.[0]
      if (key && result.data != null) {
        map.set(key, result.data)
      }
    })
    return map
  }, [priceResults, tokenEntries])

  const totals = useMemo(() => {
    if (!shouldFetch) return ZERO_TOTALS
    return borrowMarkets.reduce<Totals>(
      (acc, market, index) => {
        const stats = statsResults[index]?.data as BorrowStats | undefined
        if (stats) {
          const collateralPrice = priceMap.get(getTokenKey(market.chain, market.assets.collateral.address))
          const borrowPrice = priceMap.get(getTokenKey(market.chain, market.assets.borrowed.address))
          const collateralAmount = stats.collateral ?? 0
          const borrowTokenAmount = getBorrowTokenAmount(stats)
          if (collateralPrice != null) {
            acc.collateralValue += collateralAmount * collateralPrice
          }
          if (borrowPrice != null) {
            acc.collateralValue += borrowTokenAmount * borrowPrice
            acc.borrowedValue += (stats.debt ?? 0) * borrowPrice
          }
        }
        return acc
      },
      {
        collateralValue: 0,
        borrowedValue: 0,
        suppliedValue: 0,
        rewardsValue: 0,
      },
    )
  }, [borrowMarkets, priceMap, shouldFetch, statsResults])

  const totalsWithSupply = useMemo(() => {
    if (!shouldFetch) return ZERO_TOTALS
    return supplyMarkets.reduce<Totals>(
      (acc, market, index) => {
        const earnings = earningsResults[index]?.data
        if (earnings) {
          const borrowPrice = priceMap.get(getTokenKey(market.chain, market.assets.borrowed.address))
          if (borrowPrice != null) {
            acc.suppliedValue += (earnings.totalCurrentAssets ?? 0) * borrowPrice
            acc.rewardsValue += (earnings.earnings ?? 0) * borrowPrice
          }
        }
        return acc
      },
      { ...totals },
    )
  }, [earningsResults, priceMap, shouldFetch, supplyMarkets, totals])

  const statsFetching = statsResults.some((result) => result.isFetching)
  const earningsFetching = earningsResults.some((result) => result.isFetching)
  const priceFetching = priceResults.some((result) => result.isFetching)
  const hasStatsData = statsResults.some((result) => result.data != null)
  const hasEarningsData = earningsResults.some((result) => result.data != null)
  const hasAnyData = hasStatsData || hasEarningsData

  const isInitialLoading = shouldFetch && !hasAnyData && (statsFetching || earningsFetching || priceFetching)

  return {
    totals: shouldFetch ? totalsWithSupply : ZERO_TOTALS,
    isInitialLoading,
    isFetching: shouldFetch && (statsFetching || earningsFetching || priceFetching),
  }
}
