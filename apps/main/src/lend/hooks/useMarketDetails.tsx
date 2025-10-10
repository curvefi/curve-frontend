import lodash from 'lodash'
import { useMemo } from 'react'
import { useMarketDetails as useLendMarketDetails } from '@/lend/entities/market-details'
import { networks } from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import type { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { MarketDetailsProps } from '@/llamalend/features/market-details'
import type { Chain, Address } from '@curvefi/prices-api'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType } from '@ui-kit/types/market'
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
  const blockchainId = networks[chainId]?.id as Chain
  const { collateral_token, borrowed_token } = llamma ?? {}
  const { controller, vault } = llamma?.addresses ?? {}
  const marketRate = useStore((state) => state.markets.ratesMapper[chainId]?.[llammaId])

  const {
    data: { rates, collateralAmount, borrowedAmount, cap, available, maxLeverage, crvRates, rewardsApr },
    isLoading: isMarketDetailsLoading,
  } = useLendMarketDetails({ chainId, marketId: llammaId })
  const { data: lendingSnapshots, isLoading: isSnapshotsLoading } = useLendingSnapshots({
    blockchainId,
    contractAddress: controller as Address,
    agg: 'day',
    limit: 30, // fetch last 30 days for 30 day average calcs
  })
  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: collateral_token?.address,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: borrowed_token?.address,
  })

  const { data: campaignsVault } = useCampaignsByAddress({ blockchainId, address: vault as Address })
  const { data: campaignsController } = useCampaignsByAddress({ blockchainId, address: controller as Address })
  const campaigns = [...campaignsVault, ...campaignsController]

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
        borrowApy: ({ borrowApy }) => Number(borrowApy) * 100,
        lendApy: ({ lendApy }) => Number(lendApy) * 100,
        borrowRebasingYield: ({ collateralToken }) => collateralToken.rebasingYield,
        supplyRebasingYield: ({ borrowedToken }) => borrowedToken.rebasingYield,
        averageSupplyAprCrvMinBoost: ({ lendAprCrv0Boost }) => lendAprCrv0Boost,
        averageSupplyAprCrvMaxBoost: ({ lendAprCrvMaxBoost }) => lendAprCrvMaxBoost,
        averageTotalExtraIncentivesApr: ({ extraRewardApr }) => extraRewardApr.reduce((acc, r) => acc + r.rate, 0),
      }) ?? {
        borrowApy: null,
        lendApy: null,
        borrowRebasingYield: null,
        supplyRebasingYield: null,
        averageSupplyAprCrvMinBoost: null,
        averageSupplyAprCrvMaxBoost: null,
        averageTotalExtraIncentivesApr: null,
      },
    [lendingSnapshots],
  )

  const borrowApy = rates?.borrowApy ?? marketRate?.rates?.borrowApy
  const supplyApy = rates?.lendApy ?? marketRate?.rates?.lendApy
  const supplyAprCrvMinBoost = crvRates?.[0] ?? lendingSnapshots?.[0]?.lendAprCrv0Boost ?? 0
  const supplyAprCrvMaxBoost = crvRates?.[1] ?? lendingSnapshots?.[0]?.lendAprCrvMaxBoost ?? 0
  const collateralRebasingYield = lendingSnapshots?.[lendingSnapshots.length - 1]?.collateralToken?.rebasingYield // take only most recent rebasing yield
  const borrowRebasingYield = lendingSnapshots?.[lendingSnapshots.length - 1]?.borrowedToken?.rebasingYield // take only most recent rebasing yield
  const extraIncentivesTotalApr = sum(rewardsApr?.map((r) => r.apy) ?? [])
  const totalSupplyRateMinBoost =
    supplyApy == null
      ? null
      : Number(supplyApy) + (borrowRebasingYield ?? 0) + extraIncentivesTotalApr + (supplyAprCrvMinBoost ?? 0)
  const totalSupplyRateMaxBoost =
    supplyApy == null
      ? null
      : Number(supplyApy) + (borrowRebasingYield ?? 0) + extraIncentivesTotalApr + (supplyAprCrvMaxBoost ?? 0)
  const totalAverageBorrowRate = averageBorrowApy == null ? null : averageBorrowApy - (averageBorrowRebasingYield ?? 0)
  const totalAverageSupplyRateMinBoost =
    averageLendApy == null
      ? null
      : averageLendApy +
        (averageSupplyRebasingYield ?? 0) +
        (averageTotalExtraIncentivesApr ?? 0) +
        (averageSupplyAprCrvMinBoost ?? 0)
  const totalAverageSupplyRateMaxBoost =
    averageLendApy == null
      ? null
      : averageLendApy +
        (averageSupplyRebasingYield ?? 0) +
        (averageTotalExtraIncentivesApr ?? 0) +
        (averageSupplyAprCrvMaxBoost ?? 0)

  return {
    marketType: LlamaMarketType.Lend,
    blockchainId,
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
      averageRate: averageBorrowApy ?? null,
      averageRateLabel: averageMultiplierString,
      rebasingYield: collateralRebasingYield ?? null,
      averageRebasingYield: averageBorrowRebasingYield ?? null,
      totalBorrowRate: borrowApy == null ? null : Number(borrowApy) - (collateralRebasingYield ?? 0),
      totalAverageBorrowRate,
      extraRewards: campaigns,
      loading: !llamma || isSnapshotsLoading || isMarketDetailsLoading.marketOnChainRates,
    },
    supplyAPY: {
      rate: supplyApy != null ? Number(supplyApy) : null,
      averageRate: averageLendApy ?? null,
      averageRateLabel: averageMultiplierString,
      supplyAprCrvMinBoost,
      supplyAprCrvMaxBoost,
      averageSupplyAprCrvMinBoost: averageSupplyAprCrvMinBoost ?? null,
      averageSupplyAprCrvMaxBoost: averageSupplyAprCrvMaxBoost ?? null,
      averageRebasingYield: averageSupplyRebasingYield ?? null,
      averageTotalExtraIncentivesApr: averageTotalExtraIncentivesApr ?? null,
      totalSupplyRateMinBoost,
      totalSupplyRateMaxBoost,
      totalAverageSupplyRateMinBoost,
      totalAverageSupplyRateMaxBoost,
      rebasingYield: borrowRebasingYield ?? null,
      extraIncentives: rewardsApr
        ? rewardsApr.map((r) => ({
            title: r.symbol,
            percentage: r.apy,
            blockchainId,
            address: r.tokenAddress,
          }))
        : [],
      extraRewards: campaigns,
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
