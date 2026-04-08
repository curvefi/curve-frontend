import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import { useMarketCapAndAvailable, useMarketRates, useMarketVaultOnChainRewards } from '@/llamalend/queries/market'
import type { BorrowRate, SupplyRate } from '@/llamalend/rates.types'
import {
  aprToApy,
  formatSupplyExtraIncentives,
  getBorrowRateMetrics,
  getLatestSnapshotValue,
  getSnapshotBorrowApr,
  getSnapshotCollateralRebasingYieldApr,
  getSupplyApyAverageMetrics,
  getSupplyApyMetrics,
  sumOnChainExtraIncentivesApy,
  toNumberOrNull,
} from '@/llamalend/rates.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { notFalsyArray } from '@primitives/objects.utils'
import { useCampaignsByAddress, type CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import { AVERAGE_CATEGORIES, type AverageCategory } from '@ui-kit/utils'

export type AvailableLiquidity = {
  value: number | null | undefined
  max: number | null | undefined
  loading: boolean
}

const RATE_CATEGORY: AverageCategory = 'llamalend.market.rate'

const { window: RATE_WINDOW } = AVERAGE_CATEGORIES[RATE_CATEGORY]

function buildSupplyRate({
  supplyApy,
  rebasingYieldApy,
  marketOnChainRewards,
  lendingSnapshots,
  campaigns,
  blockchainId,
  loading,
  category,
}: {
  supplyApy?: number | string | null
  rebasingYieldApy?: number | string | null
  marketOnChainRewards:
    | { crvRates?: number[]; rewardsApr?: { apy: number; symbol: string; tokenAddress: string }[] }
    | undefined
  lendingSnapshots: LendingSnapshot[] | undefined
  campaigns: CampaignPoolRewards[]
  blockchainId: Chain | undefined
  loading: boolean
  category: AverageCategory
}): SupplyRate {
  const { window: daysBack } = AVERAGE_CATEGORIES[category]
  const supplyMetrics = getSupplyApyMetrics({
    supplyApy: toNumberOrNull(supplyApy),
    rebasingYieldApy: toNumberOrNull(rebasingYieldApy),
    crvMinBoostApr: marketOnChainRewards?.crvRates?.[0],
    crvMaxBoostApr: marketOnChainRewards?.crvRates?.[1],
    extraIncentivesApy: sumOnChainExtraIncentivesApy(marketOnChainRewards?.rewardsApr),
  })
  const supplyAverageMetrics = getSupplyApyAverageMetrics({
    snapshots: lendingSnapshots,
    daysBack,
  })

  return {
    ...supplyMetrics,
    ...supplyAverageMetrics,
    averageCategory: category,
    extraIncentives: notFalsyArray(
      blockchainId &&
        formatSupplyExtraIncentives({
          incentives: notFalsyArray(
            marketOnChainRewards?.rewardsApr?.map((reward) => ({
              title: reward.symbol,
              percentage: aprToApy(reward.apy) as number,
              blockchainId,
              address: reward.tokenAddress,
            })),
          ),
          baseRate: supplyMetrics.supplyApyCrvMinBoost,
        }),
    ),
    extraRewards: campaigns,
    loading,
  }
}

export const usePageHeader = ({
  chainId,
  marketId,
  market,
  blockchainId,
}: {
  chainId: number
  marketId: string
  market: LlamaMarketTemplate | null | undefined
  blockchainId: Chain | undefined
}) => {
  const isMarketMetadataLoading = !market
  const isLendMarket = market instanceof LendMarketTemplate
  const vaultAddress = (isLendMarket ? market.addresses.vault : undefined) as Address | undefined
  const controllerAddress = (isLendMarket ? market.addresses.controller : market?.controller) as Address | undefined
  const marketType = isLendMarket ? LlamaMarketType.Lend : LlamaMarketType.Mint

  const { data: snapshots, isLoading: isSnapshotsLoading } = useLlamaSnapshot(
    market ?? undefined,
    blockchainId,
    Boolean(blockchainId && market),
    { kind: 'limit', limit: RATE_WINDOW },
  )

  const { data: marketRates, isLoading: isMarketRatesLoading } = useMarketRates(
    { chainId, marketId },
    !isMarketMetadataLoading,
  )
  const { data: capAndAvailable, isLoading: isCapAndAvailableLoading } = useMarketCapAndAvailable({ chainId, marketId })
  const { data: marketOnChainRewards, isLoading: isMarketOnChainRewardsLoading } = useMarketVaultOnChainRewards(
    { chainId, marketId },
    isLendMarket,
  )

  const { data: controllerCampaigns } = useCampaignsByAddress({
    blockchainId,
    address: controllerAddress,
  })
  const { data: vaultCampaigns } = useCampaignsByAddress({ blockchainId, address: vaultAddress })
  const campaigns = isLendMarket ? [...vaultCampaigns, ...controllerCampaigns] : controllerCampaigns
  const borrowCampaigns = useFilteredRewards(campaigns, marketType, MarketRateType.Borrow)
  const supplyCampaigns = useFilteredRewards(campaigns, marketType, MarketRateType.Supply)

  const metrics = getBorrowRateMetrics({
    borrowRate: toNumberOrNull(marketRates?.borrowApr),
    snapshots,
    getBorrowRate: getSnapshotBorrowApr,
    getRebasingYield: getSnapshotCollateralRebasingYieldApr,
    daysBack: RATE_WINDOW,
  })
  const borrowRate: BorrowRate = {
    rate: toNumberOrNull(marketRates?.borrowApr),
    averageRate: metrics.averageRate,
    averageCategory: RATE_CATEGORY,
    rebasingYield: metrics.rebasingYield,
    averageRebasingYield: metrics.averageRebasingYield,
    totalBorrowRate: metrics.totalRate,
    totalAverageBorrowRate: metrics.averageTotalRate,
    extraRewards: borrowCampaigns,
    loading: isMarketRatesLoading || isSnapshotsLoading || isMarketMetadataLoading,
  }
  const lendingSnapshots = isLendMarket ? (snapshots as LendingSnapshot[] | undefined) : undefined
  const rebasingYieldApy = getLatestSnapshotValue(lendingSnapshots, (snapshot) => snapshot.borrowedToken.rebasingYield)
  const supplyRate = isLendMarket
    ? buildSupplyRate({
        supplyApy: marketRates?.lendApy,
        rebasingYieldApy,
        marketOnChainRewards,
        lendingSnapshots,
        campaigns: supplyCampaigns,
        blockchainId,
        loading: isMarketRatesLoading || isSnapshotsLoading || isMarketOnChainRewardsLoading || isMarketMetadataLoading,
        category: RATE_CATEGORY,
      })
    : undefined

  const availableLiquidity: AvailableLiquidity = {
    value: toNumberOrNull(capAndAvailable?.available),
    max: toNumberOrNull(capAndAvailable?.totalAssets),
    loading: isCapAndAvailableLoading || isMarketMetadataLoading,
  }

  return { borrowRate, supplyRate, availableLiquidity }
}
