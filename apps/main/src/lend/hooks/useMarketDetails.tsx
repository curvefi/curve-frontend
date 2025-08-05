import meanBy from 'lodash/meanBy'
import { useMemo } from 'react'
import { useMarketDetails as useLendMarketDetails } from '@/lend/entities/market-details'
import { networks } from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import type { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { Chain, Address } from '@curvefi/prices-api'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { MarketDetailsProps } from '@ui-kit/features/market-details'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

type UseMarketDetailsProps = {
  chainId: ChainId
  llamma: OneWayMarketTemplate | null | undefined
  llammaId: string
}

export const useMarketDetails = ({
  chainId,
  llamma,
  llammaId,
}: UseMarketDetailsProps): Omit<MarketDetailsProps, 'marketPage'> => {
  const marketRate = useStore((state) => state.markets.ratesMapper[chainId]?.[llammaId])

  const { data: marketDetails, isLoading: isMarketDetailsLoading } = useLendMarketDetails({
    chainId,
    marketId: llammaId,
  })
  const { data: lendingSnapshots, isLoading: isSnapshotsLoading } = useLendingSnapshots({
    blockchainId: networks[chainId as keyof typeof networks]?.id as Chain,
    contractAddress: llamma?.addresses.controller as Address,
  })
  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId: chainId,
    tokenAddress: llamma?.collateral_token.address,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId: chainId,
    tokenAddress: llamma?.borrowed_token.address,
  })

  const thirtyDayAvgRates = useMemo(() => {
    if (!lendingSnapshots) return null

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentSnapshots = lendingSnapshots.filter((snapshot) => new Date(snapshot.timestamp) > thirtyDaysAgo)

    if (recentSnapshots.length === 0) return null

    return {
      borrowApyAvg: meanBy(recentSnapshots, ({ borrowApy }) => borrowApy) * 100,
      lendApyAvg: meanBy(recentSnapshots, ({ lendApy }) => lendApy) * 100,
    }
  }, [lendingSnapshots])

  const borrowApy = marketDetails.rates?.borrowApy ?? marketRate?.rates?.borrowApy
  const lendApy = marketDetails.rates?.lendApy ?? marketRate?.rates?.lendApy

  return {
    blockchainId: networks[chainId as keyof typeof networks]?.id as Chain,
    collateral: {
      symbol: llamma?.collateral_token.symbol ?? null,
      tokenAddress: llamma?.collateral_token.address,
      total: marketDetails.collateralAmount ?? null,
      totalUsdValue:
        marketDetails.collateralAmount && collateralUsdRate ? marketDetails.collateralAmount * collateralUsdRate : null,
      usdRate: collateralUsdRate ?? null,
      loading: !llamma || isMarketDetailsLoading.marketCollateralAmounts || collateralUsdRateLoading,
    },
    borrowToken: {
      symbol: llamma?.borrowed_token.symbol ?? null,
      tokenAddress: llamma?.borrowed_token.address,
      total: marketDetails.borrowedAmount ?? null,
      totalUsdValue:
        marketDetails.borrowedAmount && borrowedUsdRate ? marketDetails.borrowedAmount * borrowedUsdRate : null,
      usdRate: borrowedUsdRate ?? null,
      loading: !llamma || isMarketDetailsLoading.marketCollateralAmounts || borrowedUsdRateLoading,
    },
    borrowAPY: {
      value: borrowApy != null ? Number(borrowApy) : null,
      thirtyDayAvgRate: thirtyDayAvgRates?.borrowApyAvg ?? null,
      loading: !llamma || isSnapshotsLoading || isMarketDetailsLoading.marketOnChainRates,
    },
    lendingAPY: {
      value: lendApy != null ? Number(lendApy) : null,
      thirtyDayAvgRate: thirtyDayAvgRates?.lendApyAvg ?? null,
      loading: !llamma || isSnapshotsLoading || isMarketDetailsLoading.marketOnChainRates,
    },
    availableLiquidity: {
      value: marketDetails.available ?? null,
      max: marketDetails.cap ?? null,
      loading: !llamma || isMarketDetailsLoading.marketCapAndAvailable,
    },
    maxLeverage: marketDetails.value
      ? {
          value: Number(marketDetails.value),
          loading: !llamma || isMarketDetailsLoading.marketMaxLeverage,
        }
      : undefined,
  }
}
