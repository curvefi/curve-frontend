import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import { useMarketCapAndAvailable, useMarketRates, useMarketVaultOnChainRewards } from '@/llamalend/queries/market'
import {
  LAST_MONTH,
  getBorrowRateMetrics,
  getSnapshotBorrowRate,
  getSnapshotCollateralRebasingYieldRate,
  getSupplyRateMetrics,
  toNumberOrNull,
} from '@/llamalend/rates.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import type { ExtraIncentive } from '@ui-kit/types/market'
import type { AvailableLiquidity, BorrowRate, PageHeaderData, SupplyRate } from './page-header.types'

const AVERAGE_RATE_LABEL = `${LAST_MONTH}D`
const SNAPSHOTS_QUERY_LIMIT = LAST_MONTH

type UsePageHeaderParams = {
  chainId: number
  marketId: string
  market: LlamaMarketTemplate | null | undefined
  blockchainId: Chain | undefined
}

export const usePageHeader = ({ chainId, marketId, market, blockchainId }: UsePageHeaderParams): PageHeaderData => {
  const isMarketMetadataLoading = !market
  const lendMarket = market instanceof LendMarketTemplate ? market : undefined
  const vaultAddress = lendMarket?.addresses.vault as Address | undefined

  const { data: snapshots, isLoading: isSnapshotsLoading } = useLlamaSnapshot(
    market ?? undefined,
    blockchainId,
    Boolean(blockchainId && market),
    SNAPSHOTS_QUERY_LIMIT,
  )

  const { data: marketRates, isLoading: isMarketRatesLoading } = useMarketRates({ chainId, marketId })
  const { data: capAndAvailable, isLoading: isCapAndAvailableLoading } = useMarketCapAndAvailable({ chainId, marketId })
  const { data: marketOnChainRewards, isLoading: isMarketOnChainRewardsLoading } = useMarketVaultOnChainRewards(
    { chainId, marketId },
    lendMarket != null,
  )

  const { data: controllerCampaigns } = useCampaignsByAddress({
    blockchainId,
    address: lendMarket?.addresses.controller as Address | undefined,
  })
  const { data: vaultCampaigns } = useCampaignsByAddress({ blockchainId, address: vaultAddress })
  const campaigns = lendMarket ? [...vaultCampaigns, ...controllerCampaigns] : controllerCampaigns

  // Borrow rate
  const metrics = getBorrowRateMetrics({
    borrowRate: toNumberOrNull(marketRates?.borrowApr),
    snapshots,
    getBorrowRate: getSnapshotBorrowRate,
    getRebasingYield: getSnapshotCollateralRebasingYieldRate,
  })
  const borrowApr = toNumberOrNull(marketRates?.borrowApr)
  const borrowRate: BorrowRate = {
    rate: borrowApr,
    averageRate: metrics.averageRate,
    averageRateLabel: AVERAGE_RATE_LABEL,
    rebasingYield: metrics.rebasingYield,
    averageRebasingYield: metrics.averageRebasingYield,
    totalBorrowRate: metrics.totalRate,
    totalAverageBorrowRate: metrics.averageTotalRate,
    extraRewards: campaigns,
    loading: isMarketRatesLoading || isSnapshotsLoading || isMarketMetadataLoading,
  }

  // Supply rate (lend markets only)
  const supplyRate = lendMarket ? buildSupplyRate(snapshots as LendingSnapshot[] | undefined) : undefined

  const availableLiquidity: AvailableLiquidity = {
    value: toNumberOrNull(capAndAvailable?.available),
    max: toNumberOrNull(capAndAvailable?.cap),
    loading: isCapAndAvailableLoading || isMarketMetadataLoading,
  }

  return { borrowRate, supplyRate, availableLiquidity }

  function buildSupplyRate(lendingSnapshots: LendingSnapshot[] | undefined): SupplyRate {
    const supplyMetrics = getSupplyRateMetrics({
      supplyApy: toNumberOrNull(marketRates?.lendApy),
      snapshots: lendingSnapshots,
      onChainCrvRates: marketOnChainRewards?.crvRates,
      onChainRewardsApr: marketOnChainRewards?.rewardsApr,
    })

    const extraIncentives: ExtraIncentive[] =
      marketOnChainRewards?.rewardsApr && blockchainId
        ? marketOnChainRewards.rewardsApr.map((reward) => ({
            title: reward.symbol,
            percentage: reward.apy,
            blockchainId,
            address: reward.tokenAddress,
          }))
        : []

    return {
      rate: supplyMetrics.supplyApy,
      averageRate: supplyMetrics.averageLendApy,
      averageRateLabel: AVERAGE_RATE_LABEL,
      supplyAprCrvMinBoost: supplyMetrics.supplyAprCrvMinBoost,
      supplyAprCrvMaxBoost: supplyMetrics.supplyAprCrvMaxBoost,
      averageSupplyAprCrvMinBoost: supplyMetrics.averageAprCrvMinBoost,
      averageSupplyAprCrvMaxBoost: supplyMetrics.averageAprCrvMaxBoost,
      rebasingYield: supplyMetrics.rebasingYield,
      averageRebasingYield: supplyMetrics.averageRebasingYield,
      totalSupplyRateMinBoost: supplyMetrics.totalMinBoost,
      totalSupplyRateMaxBoost: supplyMetrics.totalMaxBoost,
      totalAverageSupplyRateMinBoost: supplyMetrics.totalAverageMinBoost,
      totalAverageSupplyRateMaxBoost: supplyMetrics.totalAverageMaxBoost,
      extraIncentives,
      averageTotalExtraIncentivesApr: supplyMetrics.averageExtraIncentivesApr,
      extraRewards: campaigns,
      loading: isMarketRatesLoading || isSnapshotsLoading || isMarketOnChainRewardsLoading || isMarketMetadataLoading,
    }
  }
}
