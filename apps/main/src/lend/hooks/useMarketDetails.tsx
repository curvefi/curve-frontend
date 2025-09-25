import lodash from 'lodash'
import { useMemo } from 'react'
import { useMarketDetails as useLendMarketDetails } from '@/lend/entities/market-details'
import { networks } from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import type { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { MarketDetailsProps } from '@/llamalend/features/market-details'
import type { Chain, Address } from '@curvefi/prices-api'
import { useCampaigns } from '@ui-kit/entities/campaigns'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType } from '@ui-kit/types/market'
import { fromPrecise, multiplyPrecise, negate, sumPrecise, toPrecise } from '@ui-kit/utils'
import { calculateAverageRates } from '@ui-kit/utils/averageRates'

const { sum } = lodash

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
  } = useLendMarketDetails({ chainId, marketId: llammaId })
  const { data: lendingSnapshots, isLoading: isSnapshotsLoading } = useLendingSnapshots({
    blockchainId: networks[chainId]?.id as Chain,
    contractAddress: controller as Address,
    agg: 'day',
    limit: 30, // fetch last 30 days for 30-day average
  })
  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: collateral_token?.address,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: borrowed_token?.address,
  })
  const { data: campaigns } = useCampaigns({})

  const {
    borrowApy: averageBorrowApy,
    lendApy: averageLendApy,
    borrowRebasingYield: averageBorrowRebasingYield,
    supplyRebasingYield: averageSupplyRebasingYield,
    averageSupplyAprCrvMinBoost: averageSupplyAprCrvMinBoost,
    averageSupplyAprCrvMaxBoost: averageSupplyAprCrvMaxBoost,
    averageTotalExtraIncentivesApr: averageTotalExtraIncentivesApr,
  } = useMemo(
    () =>
      calculateAverageRates(lendingSnapshots, averageMultiplier, {
        borrowApy: ({ borrowApy }) => multiplyPrecise(borrowApy, 100),
        lendApy: ({ lendApy }) => multiplyPrecise(lendApy, 100),
        borrowRebasingYield: ({ collateralToken }) => toPrecise(collateralToken.rebasingYield),
        supplyRebasingYield: ({ borrowedToken }) => toPrecise(borrowedToken.rebasingYield),
        averageSupplyAprCrvMinBoost: ({ lendAprCrv0Boost }) => toPrecise(lendAprCrv0Boost),
        averageSupplyAprCrvMaxBoost: ({ lendAprCrvMaxBoost }) => toPrecise(lendAprCrvMaxBoost),
        averageTotalExtraIncentivesApr: ({ extraRewardApr }) => sumPrecise(...extraRewardApr.map((r) => r.rate)),
      }) ?? {},
    [lendingSnapshots],
  )

  const borrowApy = toPrecise(rates?.borrowApy ?? marketRate?.rates?.borrowApy)
  const supplyApy = toPrecise(rates?.lendApy ?? marketRate?.rates?.lendApy)
  const supplyAprCrvMinBoost = toPrecise(crvRates?.[0] ?? lendingSnapshots?.[0]?.lendAprCrv0Boost)
  const supplyAprCrvMaxBoost = toPrecise(crvRates?.[1] ?? lendingSnapshots?.[0]?.lendAprCrvMaxBoost)
  const collateralRebasingYield = toPrecise(
    lendingSnapshots?.[lendingSnapshots.length - 1]?.collateralToken?.rebasingYield,
  ) // take only most recent rebasing yield
  const borrowRebasingYield = toPrecise(lendingSnapshots?.[lendingSnapshots.length - 1]?.borrowedToken?.rebasingYield) // take only most recent rebasing yield
  const campaignRewards =
    campaigns && vault && controller
      ? [...(campaigns[vault.toLowerCase()] ?? []), ...(campaigns[controller.toLowerCase()] ?? [])]
      : []
  const extraIncentivesTotalApr = sum(rewardsApr?.map((r) => r.apy) ?? [])
  const totalSupplyRateMinBoost =
    supplyApy == null
      ? undefined
      : sumPrecise(supplyApy, borrowRebasingYield, extraIncentivesTotalApr, supplyAprCrvMinBoost)
  const totalSupplyRateMaxBoost =
    supplyApy == null
      ? undefined
      : sumPrecise(supplyApy, borrowRebasingYield, extraIncentivesTotalApr, supplyAprCrvMaxBoost)
  const totalAverageBorrowRate = toPrecise(
    averageBorrowApy == null ? undefined : fromPrecise(averageBorrowApy) - fromPrecise(averageBorrowRebasingYield ?? 0),
  )
  const totalAverageSupplyRateMinBoost =
    averageLendApy == null
      ? undefined
      : sumPrecise(
          averageLendApy,
          averageSupplyRebasingYield,
          averageTotalExtraIncentivesApr,
          averageSupplyAprCrvMinBoost,
        )
  const totalAverageSupplyRateMaxBoost =
    averageLendApy == null
      ? undefined
      : sumPrecise(
          averageLendApy,
          averageSupplyRebasingYield,
          averageTotalExtraIncentivesApr,
          averageSupplyAprCrvMaxBoost,
        )

  return {
    marketType: LlamaMarketType.Lend,
    blockchainId: networks[chainId]?.id as Chain,
    collateral: {
      symbol: collateral_token?.symbol,
      tokenAddress: collateral_token?.address,
      total: collateralAmount,
      totalUsdValue: multiplyPrecise(collateralAmount, collateralUsdRate),
      usdRate: collateralUsdRate,
      loading: !llamma || isMarketDetailsLoading.marketCollateralAmounts || collateralUsdRateLoading,
    },
    borrowToken: {
      symbol: borrowed_token?.symbol,
      tokenAddress: borrowed_token?.address,
      total: borrowedAmount,
      totalUsdValue: multiplyPrecise(borrowedAmount, borrowedUsdRate),
      usdRate: borrowedUsdRate,
      loading: !llamma || isMarketDetailsLoading.marketCollateralAmounts || borrowedUsdRateLoading,
    },
    borrowAPY: {
      rate: borrowApy,
      averageRate: averageBorrowApy,
      averageRateLabel: averageMultiplierString,
      rebasingYield: collateralRebasingYield,
      averageRebasingYield: averageBorrowRebasingYield,
      totalBorrowRate: borrowApy == null ? undefined : sumPrecise(borrowApy, negate(collateralRebasingYield)),
      totalAverageBorrowRate,
      extraRewards: campaignRewards,
      loading: !llamma || isSnapshotsLoading || isMarketDetailsLoading.marketOnChainRates,
    },
    supplyAPY: {
      rate: supplyApy,
      averageRate: averageLendApy,
      averageRateLabel: averageMultiplierString,
      supplyAprCrvMinBoost,
      supplyAprCrvMaxBoost,
      averageSupplyAprCrvMinBoost: averageSupplyAprCrvMinBoost,
      averageSupplyAprCrvMaxBoost: averageSupplyAprCrvMaxBoost,
      averageRebasingYield: averageSupplyRebasingYield,
      averageTotalExtraIncentivesApr: averageTotalExtraIncentivesApr,
      totalSupplyRateMinBoost,
      totalSupplyRateMaxBoost,
      totalAverageSupplyRateMinBoost,
      totalAverageSupplyRateMaxBoost,
      rebasingYield: borrowRebasingYield,
      extraIncentives: rewardsApr
        ? rewardsApr.map((r) => ({
            title: r.symbol,
            percentage: r.apy,
            blockchainId: networks[chainId]?.id,
            address: r.tokenAddress,
          }))
        : [],
      extraRewards: campaignRewards,
      loading: !llamma || isSnapshotsLoading || isMarketDetailsLoading.marketOnChainRates,
    },
    availableLiquidity: {
      value: available,
      max: cap,
      loading: !llamma || isMarketDetailsLoading.marketCapAndAvailable,
    },
    maxLeverage: maxLeverage && {
      value: maxLeverage,
      loading: !llamma || isMarketDetailsLoading.marketMaxLeverage,
    },
  }
}
