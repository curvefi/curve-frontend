import meanBy from 'lodash/meanBy'
import { useMemo } from 'react'
import { useMarketCollateralValue } from '@/lend/entities/market-collateral-value'
import { useMarketOnChainRates } from '@/lend/entities/market-onchain-rate'
import { networks } from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import type { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { Chain, Address } from '@curvefi/prices-api'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { MarketDetailsProps } from '@ui-kit/shared/ui/MarketDetails'

type UseMarketDetailsProps = {
  chainId: ChainId
  llamma: OneWayMarketTemplate | null | undefined
  llammaId: string
}

export const useMarketDetails = ({ chainId, llamma, llammaId }: UseMarketDetailsProps): MarketDetailsProps => {
  const capAndAvailable = useStore((state) => state.markets.statsCapAndAvailableMapper[chainId]?.[llammaId])
  const maxLeverage = useStore((state) => state.markets.maxLeverageMapper[chainId]?.[llammaId])
  const { data: collateralValue, isLoading: isCollateralValueLoading } = useMarketCollateralValue({
    marketId: llammaId,
  })
  const { data: onChainRates, isLoading: isOnChainRatesLoading } = useMarketOnChainRates({ marketId: llammaId })
  const { data: lendingSnapshots, isLoading: isSnapshotsLoading } = useLendingSnapshots({
    blockchainId: networks[chainId as keyof typeof networks]?.id as Chain,
    contractAddress: llamma?.addresses.controller as Address,
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

  return {
    collateral: {
      symbol: llamma?.collateral_token.symbol ?? null,
      tokenAddress: llamma?.collateral_token.address,
      total: collateralValue?.collateral.amount ?? null,
      totalUsdValue: collateralValue?.totalUsdValue ?? null,
      usdRate: collateralValue?.collateral.usdRate ?? null,
      loading: isCollateralValueLoading,
    },
    borrowToken: {
      symbol: llamma?.borrowed_token.symbol ?? null,
      tokenAddress: llamma?.borrowed_token.address,
      total: collateralValue?.borrowed.amount ?? null,
      totalUsdValue: collateralValue?.borrowed.usdValue ?? null,
      usdRate: collateralValue?.borrowed.usdRate ?? null,
      loading: isCollateralValueLoading,
    },
    borrowAPR: {
      value: onChainRates?.rates.borrowApr ? Number(onChainRates.rates.borrowApr) : null,
      thirtyDayAvgRate: thirtyDayAvgRates?.borrowApyAvg ?? null,
      loading: isSnapshotsLoading || (isOnChainRatesLoading ?? true),
    },
    lendingAPY: {
      value: onChainRates?.rates.lendApy ? Number(onChainRates.rates.lendApy) : null,
      thirtyDayAvgRate: thirtyDayAvgRates?.lendApyAvg ?? null,
      loading: isSnapshotsLoading || (isOnChainRatesLoading ?? true),
    },
    availableLiquidity: {
      value: capAndAvailable?.available ? Number(capAndAvailable.available) : null,
      max: capAndAvailable?.cap ? Number(capAndAvailable.cap) : null,
      loading: false, // to do: set up loading state
    },
    maxLeverage: {
      value: maxLeverage ? Number(maxLeverage) : null,
      loading: false, // to do: set up loading state
    },
  }
}
