import lodash from 'lodash'
import { useMemo } from 'react'
import { useMarketDetails as useLendMarketDetails } from '@/lend/entities/market-details'
import { networks } from '@/lend/networks'
import type { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { MarketDetailsProps } from '@/llamalend/features/market-details'
import {
  LAST_MONTH,
  getBorrowRateMetrics,
  getSnapshotBorrowRate,
  getSnapshotCollateralRebasingYieldRate,
} from '@/llamalend/rates.utils'
import type { Chain, Address } from '@curvefi/prices-api'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType } from '@ui-kit/types/market'
import { calculateAverageRates } from '@ui-kit/utils/averageRates'

const { sum } = lodash

type UseMarketDetailsProps = {
  chainId: ChainId
  market: OneWayMarketTemplate | null | undefined
  marketId: string
}

const AVERAGE_RATE_LABEL = `${LAST_MONTH}D`

export const useMarketDetails = ({
  chainId,
  market,
  marketId,
}: UseMarketDetailsProps): Omit<MarketDetailsProps, 'marketPage'> => {
  const { isHydrated } = useCurve()
  const blockchainId = networks[chainId]?.id as Chain
  const { collateral_token, borrowed_token } = market ?? {}
  const { controller, vault } = market?.addresses ?? {}

  const {
    data: {
      borrowApr: marketBorrowApr,
      lendApy: marketLendApy,
      collateralAmount,
      cap,
      available,
      maxLeverage,
      crvRates,
      rewardsApr,
    },
    isLoading: isMarketDetailsLoading,
  } = useLendMarketDetails({ chainId, marketId })
  const { data: lendingSnapshots, isLoading: isSnapshotsLoading } = useLendingSnapshots({
    blockchainId,
    contractAddress: controller as Address,
    agg: 'day',
    limit: LAST_MONTH, // fetch last 30 days for 30 day average calcs
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
    lendApy: averageLendApy,
    supplyRebasingYield: averageSupplyRebasingYield,
    averageSupplyAprCrvMinBoost: averageSupplyAprCrvMinBoost,
    averageSupplyAprCrvMaxBoost: averageSupplyAprCrvMaxBoost,
    averageTotalExtraIncentivesApr: averageTotalExtraIncentivesApr,
  } = useMemo(
    () =>
      calculateAverageRates(lendingSnapshots, LAST_MONTH, {
        lendApy: ({ lendApy }) => Number(lendApy) * 100,
        supplyRebasingYield: ({ borrowedToken }) => borrowedToken.rebasingYield,
        averageSupplyAprCrvMinBoost: ({ lendAprCrv0Boost }) => lendAprCrv0Boost,
        averageSupplyAprCrvMaxBoost: ({ lendAprCrvMaxBoost }) => lendAprCrvMaxBoost,
        averageTotalExtraIncentivesApr: ({ extraRewardApr }) => extraRewardApr.reduce((acc, r) => acc + r.rate, 0),
      }) ?? {
        lendApy: null,
        supplyRebasingYield: null,
        averageSupplyAprCrvMinBoost: null,
        averageSupplyAprCrvMaxBoost: null,
        averageTotalExtraIncentivesApr: null,
      },
    [lendingSnapshots],
  )

  const borrowApr = marketBorrowApr && Number(marketBorrowApr)
  const supplyApy = marketLendApy && Number(marketLendApy)
  const supplyAprCrvMinBoost = crvRates?.[0] ?? lendingSnapshots?.[0]?.lendAprCrv0Boost ?? 0
  const supplyAprCrvMaxBoost = crvRates?.[1] ?? lendingSnapshots?.[0]?.lendAprCrvMaxBoost ?? 0
  const borrowRebasingYield = lendingSnapshots?.[lendingSnapshots.length - 1]?.borrowedToken?.rebasingYield // take only most recent rebasing yield
  const extraIncentivesTotalApr = sum(rewardsApr?.map((r) => r.apy) ?? [])
  const {
    averageRate: averageBorrowApr,
    averageRebasingYield: averageBorrowRebasingYieldApr,
    totalRate: totalBorrowApr,
    averageTotalRate: totalAverageBorrowApr,
    rebasingYield: collateralRebasingYieldApr,
  } = useMemo(
    () =>
      getBorrowRateMetrics({
        borrowRate: borrowApr,
        snapshots: lendingSnapshots,
        getBorrowRate: getSnapshotBorrowRate,
        getRebasingYield: getSnapshotCollateralRebasingYieldRate,
      }),
    [borrowApr, lendingSnapshots],
  )

  const totalSupplyRateMinBoost =
    supplyApy && Number(supplyApy) + (borrowRebasingYield ?? 0) + extraIncentivesTotalApr + (supplyAprCrvMinBoost ?? 0)
  const totalSupplyRateMaxBoost =
    supplyApy && Number(supplyApy) + (borrowRebasingYield ?? 0) + extraIncentivesTotalApr + (supplyAprCrvMaxBoost ?? 0)
  const totalAverageSupplyRateMinBoost =
    averageLendApy &&
    averageLendApy +
      (averageSupplyRebasingYield ?? 0) +
      (averageTotalExtraIncentivesApr ?? 0) +
      (averageSupplyAprCrvMinBoost ?? 0)
  const totalAverageSupplyRateMaxBoost =
    averageLendApy &&
    averageLendApy +
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
      loading: isMarketDetailsLoading.marketCollateralAmounts || collateralUsdRateLoading || !isHydrated,
    },
    borrowToken: {
      symbol: borrowed_token?.symbol ?? null,
      tokenAddress: borrowed_token?.address,
      usdRate: borrowedUsdRate ?? null,
      loading: isMarketDetailsLoading.marketCollateralAmounts || borrowedUsdRateLoading || !isHydrated,
    },
    borrowRate: {
      rate: borrowApr,
      averageRate: averageBorrowApr,
      averageRateLabel: AVERAGE_RATE_LABEL,
      rebasingYield: collateralRebasingYieldApr,
      averageRebasingYield: averageBorrowRebasingYieldApr,
      totalBorrowRate: totalBorrowApr,
      totalAverageBorrowRate: totalAverageBorrowApr,
      extraRewards: campaigns,
      loading: isSnapshotsLoading || isMarketDetailsLoading.marketRates || !isHydrated,
    },
    supplyRate: {
      rate: supplyApy,
      averageRate: averageLendApy ?? null,
      averageRateLabel: AVERAGE_RATE_LABEL,
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
      loading:
        isSnapshotsLoading ||
        isMarketDetailsLoading.marketRates ||
        isMarketDetailsLoading.marketOnChainRewards ||
        !isHydrated,
    },
    availableLiquidity: {
      value: available ?? null,
      max: cap ?? null,
      loading: isMarketDetailsLoading.marketCapAndAvailable || !isHydrated,
    },
    maxLeverage: maxLeverage
      ? {
          value: Number(maxLeverage),
          loading: isMarketDetailsLoading.marketMaxLeverage || !isHydrated,
        }
      : undefined,
  }
}
