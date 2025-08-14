import lodash from 'lodash'
import { useMemo } from 'react'
import { useMarketDetails as useLendMarketDetails } from '@/lend/entities/market-details'
import { networks } from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import type { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { Chain, Address } from '@curvefi/prices-api'
import { useCampaigns } from '@ui-kit/entities/campaigns'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { MarketDetailsProps } from '@ui-kit/features/market-details'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

const { meanBy, sum } = lodash

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
  const { data: campaigns } = useCampaigns({})

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

  const borrowApy = rates?.borrowApy ?? marketRate?.rates?.borrowApy
  const supplyApy = rates?.lendApy ?? marketRate?.rates?.lendApy
  const supplyAprCrvMinBoost = crvRates?.[0] ?? lendingSnapshots?.[0]?.lendAprCrv0Boost ?? 0
  const supplyAprCrvMaxBoost = crvRates?.[1] ?? lendingSnapshots?.[0]?.lendAprCrvMaxBoost ?? 0

  const campaignRewards =
    campaigns && vault && controller
      ? [...(campaigns[vault.toLowerCase()] ?? []), ...(campaigns[controller.toLowerCase()] ?? [])]
      : []
  const extraIncentivesTotalApr = sum(rewardsApr?.map((r) => r.apy) ?? [])

  const borrowRebasingYield = lendingSnapshots?.[0]?.borrowedToken?.rebasingYield // take only most recent rebasing yield
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
      rate: borrowApy != null ? Number(borrowApy) : null,
      averageRate: thirtyDayAvgRates?.borrowApyAvg ?? null,
      averageRateLabel: '30D',
      rebasingYield: lendingSnapshots?.[0]?.collateralToken?.rebasingYield ?? null,
      totalBorrowRate:
        borrowApy == null ? null : Number(borrowApy) - (lendingSnapshots?.[0]?.collateralToken?.rebasingYield ?? 0),
      extraRewards: campaignRewards,
      loading: !llamma || isSnapshotsLoading || isMarketDetailsLoading.marketOnChainRates,
    },
    supplyAPY: {
      rate: supplyApy != null ? Number(supplyApy) : null,
      averageRate: thirtyDayAvgRates?.lendApyAvg ?? null,
      averageRateLabel: '30D',
      supplyAprCrvMinBoost,
      supplyAprCrvMaxBoost,
      totalSupplyRateMinBoost:
        supplyApy == null
          ? null
          : Number(supplyApy) + (borrowRebasingYield ?? 0) + extraIncentivesTotalApr + (supplyAprCrvMinBoost ?? 0),
      totalSupplyRateMaxBoost:
        supplyApy == null
          ? null
          : Number(supplyApy) + (borrowRebasingYield ?? 0) + extraIncentivesTotalApr + (supplyAprCrvMaxBoost ?? 0),
      rebasingYield: borrowRebasingYield ?? null,
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
