import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import { useMarketCapAndAvailable, useMarketRates, useMarketVaultOnChainRewards } from '@/llamalend/queries/market'
import type { BorrowRate, SupplyRate } from '@/llamalend/rates.types'
import {
  LAST_MONTH,
  getBorrowRateMetrics,
  getLatestSnapshotValue,
  getSnapshotBorrowApr,
  getSnapshotCollateralRebasingYieldApr,
  getSupplyApyAverageMetrics,
  getSupplyApyMetrics,
  sumOnChainExtraIncentivesApr,
  toNumberOrNull,
} from '@/llamalend/rates.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { useCampaignsByAddress, type CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'

export type AvailableLiquidity = {
  value: number | null | undefined
  max: number | null | undefined
  loading: boolean
}

const AVERAGE_MULTIPLIER = LAST_MONTH
const AVERAGE_RATE_LABEL = `${AVERAGE_MULTIPLIER}D`

function buildSupplyRate({
  supplyApy,
  rebasingYieldApy,
  marketOnChainRewards,
  lendingSnapshots,
  campaigns,
  blockchainId,
  loading,
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
}): SupplyRate {
  const supplyMetrics = getSupplyApyMetrics({
    supplyApy: toNumberOrNull(supplyApy),
    rebasingYieldApy: toNumberOrNull(rebasingYieldApy),
    crvMinBoostApr: marketOnChainRewards?.crvRates?.[0],
    crvMaxBoostApr: marketOnChainRewards?.crvRates?.[1],
    extraIncentivesApr: sumOnChainExtraIncentivesApr(marketOnChainRewards?.rewardsApr),
  })
  const supplyAverageMetrics = getSupplyApyAverageMetrics({ snapshots: lendingSnapshots })

  return {
    ...supplyMetrics,
    ...supplyAverageMetrics,
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
  const isLendMarket = market instanceof LendMarketTemplate
  const vaultAddress = (isLendMarket ? market.addresses.vault : undefined) as Address | undefined
  const controllerAddress = (isLendMarket ? market.addresses.controller : market?.controller) as Address | undefined
  const marketType = isLendMarket ? LlamaMarketType.Lend : LlamaMarketType.Mint

  const { data: snapshots, isLoading: isSnapshotsLoading } = useLlamaSnapshot(
    market ?? undefined,
    blockchainId,
    Boolean(blockchainId && market),
    { kind: 'limit', limit: AVERAGE_MULTIPLIER },
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
  })
  const borrowRate: BorrowRate = {
    rate: toNumberOrNull(marketRates?.borrowApr),
    averageRate: metrics.averageRate,
    averageRateLabel: AVERAGE_RATE_LABEL,
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
      })
    : undefined

  const availableLiquidity: AvailableLiquidity = {
    value: toNumberOrNull(capAndAvailable?.available),
    max: toNumberOrNull(capAndAvailable?.totalAssets),
    loading: isCapAndAvailableLoading || isMarketMetadataLoading,
  }

  return { borrowRate, supplyRate, availableLiquidity }
}
