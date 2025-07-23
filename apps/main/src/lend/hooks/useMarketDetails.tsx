import meanBy from 'lodash/meanBy'
import { useMemo } from 'react'
import { useMarketCollateralAmounts } from '@/lend/entities/market-collateral-amounts'
import { useMarketMaxLeverage } from '@/lend/entities/market-max-leverage'
import { useMarketOnChainRates } from '@/lend/entities/market-onchain-rate'
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
  const capAndAvailable = useStore((state) => state.markets.statsCapAndAvailableMapper[chainId]?.[llammaId])
  const marketRate = useStore((state) => state.markets.ratesMapper[chainId]?.[llammaId])

  const { data: collateralAmounts, isLoading: isCollateralAmountsLoading } = useMarketCollateralAmounts({
    chainId,
    marketId: llammaId,
  })
  const { data: onChainRates, isLoading: isOnChainRatesLoading } = useMarketOnChainRates({
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
  const { data: maxLeverage, isLoading: maxLeverageLoading } = useMarketMaxLeverage({
    chainId,
    marketId: llammaId,
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

  const borrowApy = onChainRates?.rates?.borrowApy ?? marketRate?.rates?.borrowApy
  const lendApy = onChainRates?.rates?.lendApy ?? marketRate?.rates?.lendApy

  return {
    collateral: {
      symbol: llamma?.collateral_token.symbol ?? null,
      tokenAddress: llamma?.collateral_token.address,
      total: collateralAmounts?.collateralAmount ?? null,
      totalUsdValue:
        collateralAmounts?.collateralAmount && collateralUsdRate
          ? collateralAmounts.collateralAmount * collateralUsdRate
          : null,
      usdRate: collateralUsdRate ?? null,
      loading: isCollateralAmountsLoading || collateralUsdRateLoading,
    },
    borrowToken: {
      symbol: llamma?.borrowed_token.symbol ?? null,
      tokenAddress: llamma?.borrowed_token.address,
      total: collateralAmounts?.borrowedAmount ?? null,
      totalUsdValue:
        collateralAmounts?.borrowedAmount && borrowedUsdRate
          ? collateralAmounts.borrowedAmount * borrowedUsdRate
          : null,
      usdRate: borrowedUsdRate ?? null,
      loading: isCollateralAmountsLoading || borrowedUsdRateLoading,
    },
    borrowAPY: {
      value: borrowApy != null ? Number(borrowApy) : null,
      thirtyDayAvgRate: thirtyDayAvgRates?.borrowApyAvg ?? null,
      loading: isSnapshotsLoading || (isOnChainRatesLoading ?? true),
    },
    lendingAPY: {
      value: lendApy != null ? Number(lendApy) : null,
      thirtyDayAvgRate: thirtyDayAvgRates?.lendApyAvg ?? null,
      loading: isSnapshotsLoading || (isOnChainRatesLoading ?? true),
    },
    availableLiquidity: {
      value: capAndAvailable?.available ? Number(capAndAvailable.available) : null,
      max: capAndAvailable?.cap ? Number(capAndAvailable.cap) : null,
      loading: false, // to do: set up loading state
    },
    maxLeverage: maxLeverage
      ? {
          value: Number(maxLeverage.value),
          loading: maxLeverageLoading,
        }
      : undefined,
  }
}
