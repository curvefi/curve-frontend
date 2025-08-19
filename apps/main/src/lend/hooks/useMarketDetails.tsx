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
import { LlamaMarketType } from '@ui-kit/types/market'

const { meanBy, sum } = lodash

type UseMarketDetailsProps = {
  chainId: ChainId
  llamma: OneWayMarketTemplate | null | undefined
  llammaId: string
}

const averageMultiplier = 30
const averageMultiplierString = `${averageMultiplier}D`

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
    agg: 'day',
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

  const averageRates = useMemo(() => {
    if (!lendingSnapshots) return null

    const averageStartDate = new Date()
    averageStartDate.setDate(averageStartDate.getDate() - averageMultiplier)

    const recentSnapshots = lendingSnapshots.filter(
      (snapshot) => new Date(snapshot.timestamp).getTime() > averageStartDate.getTime(),
    )

    if (recentSnapshots.length === 0) return null

    return {
      borrowApy: meanBy(recentSnapshots, ({ borrowApy }) => Number(borrowApy)) * 100,
      lendApy: meanBy(recentSnapshots, ({ lendApy }) => Number(lendApy)) * 100,
      borrowRebasingYield: meanBy(recentSnapshots, ({ collateralToken }) => collateralToken.rebasingYield) ?? null,
      supplyRebasingYield: meanBy(recentSnapshots, ({ borrowedToken }) => borrowedToken.rebasingYield) ?? null,
      averageSupplyAprCrvMinBoost: meanBy(recentSnapshots, ({ lendAprCrv0Boost }) => lendAprCrv0Boost) ?? null,
      averageSupplyAprCrvMaxBoost: meanBy(recentSnapshots, ({ lendAprCrvMaxBoost }) => lendAprCrvMaxBoost) ?? null,
      averageTotalExtraIncentivesApr:
        meanBy(recentSnapshots, ({ extraRewardApr }) => extraRewardApr.reduce((acc, r) => acc + r.rate, 0)) ?? null,
    }
  }, [lendingSnapshots])

  const borrowApy = rates?.borrowApy ?? marketRate?.rates?.borrowApy
  const supplyApy = rates?.lendApy ?? marketRate?.rates?.lendApy
  const supplyAprCrvMinBoost = crvRates?.[0] ?? lendingSnapshots?.[0]?.lendAprCrv0Boost ?? 0
  const supplyAprCrvMaxBoost = crvRates?.[1] ?? lendingSnapshots?.[0]?.lendAprCrvMaxBoost ?? 0
  const collateralRebasingYield = lendingSnapshots?.[lendingSnapshots.length - 1]?.collateralToken?.rebasingYield // take only most recent rebasing yield
  const borrowRebasingYield = lendingSnapshots?.[lendingSnapshots.length - 1]?.borrowedToken?.rebasingYield // take only most recent rebasing yield
  const campaignRewards =
    campaigns && vault && controller
      ? [...(campaigns[vault.toLowerCase()] ?? []), ...(campaigns[controller.toLowerCase()] ?? [])]
      : []
  const extraIncentivesTotalApr = sum(rewardsApr?.map((r) => r.apy) ?? [])
  const totalSupplyRateMinBoost =
    supplyApy == null
      ? null
      : Number(supplyApy) + (borrowRebasingYield ?? 0) + extraIncentivesTotalApr + (supplyAprCrvMinBoost ?? 0)
  const totalSupplyRateMaxBoost =
    supplyApy == null
      ? null
      : Number(supplyApy) + (borrowRebasingYield ?? 0) + extraIncentivesTotalApr + (supplyAprCrvMaxBoost ?? 0)
  const totalAverageBorrowRate =
    averageRates?.borrowApy == null ? null : averageRates.borrowApy - (averageRates.borrowRebasingYield ?? 0)
  const totalAverageSupplyRateMinBoost =
    averageRates?.lendApy == null
      ? null
      : averageRates.lendApy +
        (averageRates.supplyRebasingYield ?? 0) +
        (averageRates.averageTotalExtraIncentivesApr ?? 0) +
        (averageRates.averageSupplyAprCrvMinBoost ?? 0)
  const totalAverageSupplyRateMaxBoost =
    averageRates?.lendApy == null
      ? null
      : averageRates.lendApy +
        (averageRates.supplyRebasingYield ?? 0) +
        (averageRates.averageTotalExtraIncentivesApr ?? 0) +
        (averageRates.averageSupplyAprCrvMaxBoost ?? 0)

  return {
    marketType: LlamaMarketType.Lend,
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
      averageRate: averageRates?.borrowApy ?? null,
      averageRateLabel: averageMultiplierString,
      rebasingYield: collateralRebasingYield ?? null,
      averageRebasingYield: averageRates?.borrowRebasingYield ?? null,
      totalBorrowRate: borrowApy == null ? null : Number(borrowApy) - (collateralRebasingYield ?? 0),
      totalAverageBorrowRate,
      extraRewards: campaignRewards,
      loading: !llamma || isSnapshotsLoading || isMarketDetailsLoading.marketOnChainRates,
    },
    supplyAPY: {
      rate: supplyApy != null ? Number(supplyApy) : null,
      averageRate: averageRates?.lendApy ?? null,
      averageRateLabel: averageMultiplierString,
      supplyAprCrvMinBoost,
      supplyAprCrvMaxBoost,
      averageSupplyAprCrvMinBoost: averageRates?.averageSupplyAprCrvMinBoost ?? null,
      averageSupplyAprCrvMaxBoost: averageRates?.averageSupplyAprCrvMaxBoost ?? null,
      averageRebasingYield: averageRates?.supplyRebasingYield ?? null,
      averageTotalExtraIncentivesApr: averageRates?.averageTotalExtraIncentivesApr ?? null,
      totalSupplyRateMinBoost: totalSupplyRateMinBoost == null ? null : totalSupplyRateMinBoost,
      totalSupplyRateMaxBoost: totalSupplyRateMaxBoost == null ? null : totalSupplyRateMaxBoost,
      totalAverageSupplyRateMinBoost,
      totalAverageSupplyRateMaxBoost,
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
