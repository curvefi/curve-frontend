import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import { useMarketCapAndAvailable, useMarketRates, useMarketVaultOnChainRewards } from '@/llamalend/queries/market'
import type { BorrowRate, SupplyRate } from '@/llamalend/rates.types'
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
import { useCampaignsByAddress, type CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'

export type AvailableLiquidity = {
  value: number | null | undefined
  max: number | null | undefined
  loading: boolean
}

const AVERAGE_RATE_LABEL = `${LAST_MONTH}D`
const SNAPSHOTS_QUERY_LIMIT = LAST_MONTH

function buildSupplyRate({
  marketRates,
  marketOnChainRewards,
  lendingSnapshots,
  campaigns,
  blockchainId,
  loading,
}: {
  marketRates: { lendApy?: number | string | null } | undefined
  marketOnChainRewards:
    | { crvRates?: number[]; rewardsApr?: { apy: number; symbol: string; tokenAddress: string }[] }
    | undefined
  lendingSnapshots: LendingSnapshot[] | undefined
  campaigns: CampaignPoolRewards[]
  blockchainId: Chain | undefined
  loading: boolean
}): SupplyRate {
  const supplyMetrics = getSupplyRateMetrics({
    supplyApy: toNumberOrNull(marketRates?.lendApy),
    snapshots: lendingSnapshots,
    onChainCrvRates: marketOnChainRewards?.crvRates,
    onChainRewardsApr: marketOnChainRewards?.rewardsApr,
  })

  return {
    ...supplyMetrics,
    averageRateLabel: AVERAGE_RATE_LABEL,
    extraIncentives:
      marketOnChainRewards?.rewardsApr && blockchainId
        ? marketOnChainRewards.rewardsApr.map((reward) => ({
            title: reward.symbol,
            percentage: reward.apy,
            blockchainId,
            address: reward.tokenAddress,
          }))
        : [],
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

  const metrics = getBorrowRateMetrics({
    borrowRate: toNumberOrNull(marketRates?.borrowApr),
    snapshots,
    getBorrowRate: getSnapshotBorrowRate,
    getRebasingYield: getSnapshotCollateralRebasingYieldRate,
  })
  const borrowRate: BorrowRate = {
    rate: toNumberOrNull(marketRates?.borrowApr),
    averageRate: metrics.averageRate,
    averageRateLabel: AVERAGE_RATE_LABEL,
    rebasingYield: metrics.rebasingYield,
    averageRebasingYield: metrics.averageRebasingYield,
    totalBorrowRate: metrics.totalRate,
    totalAverageBorrowRate: metrics.averageTotalRate,
    extraRewards: campaigns,
    loading: isMarketRatesLoading || isSnapshotsLoading || isMarketMetadataLoading,
  }

  const supplyRate = lendMarket
    ? buildSupplyRate({
        marketRates,
        marketOnChainRewards,
        lendingSnapshots: snapshots as LendingSnapshot[] | undefined,
        campaigns,
        blockchainId,
        loading: isMarketRatesLoading || isSnapshotsLoading || isMarketOnChainRewardsLoading || isMarketMetadataLoading,
      })
    : undefined

  const availableLiquidity: AvailableLiquidity = {
    value: toNumberOrNull(capAndAvailable?.available),
    max: toNumberOrNull(capAndAvailable?.cap),
    loading: isCapAndAvailableLoading || isMarketMetadataLoading,
  }

  return { borrowRate, supplyRate, availableLiquidity }
}
