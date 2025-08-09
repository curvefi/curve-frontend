import meanBy from 'lodash/meanBy'
import { useMemo } from 'react'
import { useMarketDetails as useLendMarketDetails } from '@/lend/entities/market-details'
import { networks } from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import type { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { Chain, Address } from '@curvefi/prices-api'
import { useQuery } from '@tanstack/react-query'
import { getCampaignsOptions } from '@ui-kit/entities/campaigns'
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
  const { collateral_token, borrowed_token } = llamma ?? {}
  const { controller, vault } = llamma?.addresses ?? {}
  const marketRate = useStore((state) => state.markets.ratesMapper[chainId]?.[llammaId])

  const {
    data: { rates, collateralAmount, borrowedAmount, cap, available, maxLeverage, crvRates, rewardsApr },
    isLoading: isMarketDetailsLoading,
  } = useLendMarketDetails({
    chainId,
    marketId: llammaId,
  })
  const { data: lendingSnapshots, isLoading: isSnapshotsLoading } = useLendingSnapshots({
    blockchainId: networks[chainId as keyof typeof networks]?.id as Chain,
    contractAddress: controller as Address,
  })
  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId: chainId,
    tokenAddress: collateral_token?.address,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId: chainId,
    tokenAddress: borrowed_token?.address,
  })
  const { data: campaigns } = useQuery(getCampaignsOptions({}, true))

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

  const borrowApy = Number(rates?.borrowApy ?? marketRate?.rates?.borrowApy)
  // TODO: add collateral token rebasing yield
  const lendApy = Number(rates?.lendApy ?? marketRate?.rates?.lendApy)
  const lendAprCrvMinBoost = crvRates?.[0] ?? lendingSnapshots?.[0]?.lendAprCrv0Boost ?? 0
  const lendAprCrvMaxBoost = crvRates?.[1] ?? lendingSnapshots?.[0]?.lendAprCrvMaxBoost ?? 0
  // TODO: add rebasing yield
  const lendTotalExtraRewardApr = rewardsApr
    ? (rewardsApr ?? []).reduce((acc, x) => acc + x.apy, 0)
    : ((lendingSnapshots?.[0]?.extraRewardApr ?? []).reduce((acc, x) => acc + x.rate, 0) ?? 0)
  const lendTotalAprMinBoost = (lendApy ?? 0) + lendAprCrvMinBoost + lendTotalExtraRewardApr
  const lendTotalAprMaxBoost = (lendApy ?? 0) + lendAprCrvMaxBoost + lendTotalExtraRewardApr

  const campaignRewards =
    campaigns && vault && controller
      ? [...(campaigns[vault.toLowerCase()] ?? []), ...(campaigns[controller.toLowerCase()] ?? [])]
      : []

  return {
    marketType: 'lend',
    blockchainId: networks[chainId as keyof typeof networks]?.id as Chain,
    collateral: {
      symbol: collateral_token?.symbol ?? null,
      tokenAddress: collateral_token?.address,
      total: collateralAmount ?? null,
      totalUsdValue: collateralAmount && collateralUsdRate ? collateralAmount * collateralUsdRate : null,
      usdRate: collateralUsdRate ?? null,
      loading: !llamma || isMarketDetailsLoading.marketCollateralAmounts || collateralUsdRateLoading,
    },
    borrowToken: {
      symbol: borrowed_token?.symbol ?? null,
      tokenAddress: borrowed_token?.address,
      total: borrowedAmount ?? null,
      totalUsdValue: borrowedAmount && borrowedUsdRate ? borrowedAmount * borrowedUsdRate : null,
      usdRate: borrowedUsdRate ?? null,
      loading: !llamma || isMarketDetailsLoading.marketCollateralAmounts || borrowedUsdRateLoading,
    },
    borrowAPY: {
      value: borrowApy != null ? borrowApy : null,
      totalApy: borrowApy != null ? borrowApy : null,
      thirtyDayAvgRate: thirtyDayAvgRates?.borrowApyAvg ?? null,
      extraRewards: campaignRewards,
      loading: !llamma || isSnapshotsLoading || isMarketDetailsLoading.marketOnChainRates,
    },
    lendingAPY: {
      value: lendApy != null ? lendApy : null,
      thirtyDayAvgRate: thirtyDayAvgRates?.lendApyAvg ?? null,
      lendAprCrvMinBoost,
      lendAprCrvMaxBoost,
      totalAprMinBoost: lendTotalAprMinBoost,
      totalAprMaxBoost: lendTotalAprMaxBoost,
      extraIncentives: rewardsApr
        ? rewardsApr.map((r) => ({
            title: r.symbol,
            percentage: r.apy,
            blockchainId: networks[chainId as keyof typeof networks]?.id as Chain,
            address: r.tokenAddress,
          }))
        : [],
      extraRewards: campaignRewards,
      loading: !llamma || isSnapshotsLoading || isMarketDetailsLoading.marketOnChainRates,
    },
    availableLiquidity: {
      value: available ?? null,
      max: cap ?? null,
      loading: !llamma || isMarketDetailsLoading.marketCapAndAvailable,
    },
    maxLeverage: maxLeverage
      ? {
          value: Number(maxLeverage),
          loading: !llamma || isMarketDetailsLoading.marketMaxLeverage,
        }
      : undefined,
  }
}
