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
import { maybes, notFalsyArray } from '@primitives/objects.utils'
import { useCampaignsByAddress, type CampaignRewards } from '@ui-kit/entities/campaigns'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import { q, type QueryProp, type Range } from '@ui-kit/types/util'
import { AVERAGE_CATEGORIES, CRVUSD_ADDRESS, type AverageCategory } from '@ui-kit/utils'

export type AvailableLiquidity = {
  value: number | null | undefined
  max: number | null | undefined
  notional: number | null | undefined
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
  category,
}: {
  supplyApy?: number | string | null
  rebasingYieldApy?: number | string | null
  marketOnChainRewards:
    | { crvRates?: Range<number> | null; rewardsApr?: { apy: number; symbol: string; tokenAddress: string }[] }
    | undefined
  lendingSnapshots: LendingSnapshot[] | undefined
  campaigns: CampaignRewards[]
  blockchainId: Chain | undefined
  category: AverageCategory
}): SupplyRate {
  const { window: daysBack } = AVERAGE_CATEGORIES[category]
  const supplyMetrics = getSupplyApyMetrics({
    supplyApy: toNumberOrNull(supplyApy),
    rebasingYieldApy: toNumberOrNull(rebasingYieldApy),
    crvBoostApr: marketOnChainRewards?.crvRates,
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
            marketOnChainRewards?.rewardsApr?.map(reward => ({
              title: reward.symbol,
              percentage: aprToApy(reward.apy)!,
              blockchainId,
              address: reward.tokenAddress,
            })),
          ),
          baseRate: supplyMetrics.supplyApyCrvMinBoost,
        }),
    ),
    extraRewards: campaigns,
  }
}

export const usePageHeader = ({
  chainId,
  marketId,
  market,
  blockchainId,
}: {
  chainId: number
  marketId: string | undefined
  market: LlamaMarketTemplate | null | undefined
  blockchainId: Chain | undefined
}) => {
  const isMarketMetadataLoading = !market
  const isLendMarket = market instanceof LendMarketTemplate
  const vaultAddress = (isLendMarket ? market.addresses.vault : undefined) as Address | undefined
  const controllerAddress = (isLendMarket ? market.addresses.controller : market?.controller) as Address | undefined
  const borrowTokenAddress = (isLendMarket ? market.addresses.borrowed_token : CRVUSD_ADDRESS) as Address | undefined
  const marketType = isLendMarket ? LlamaMarketType.Lend : LlamaMarketType.Mint

  const {
    data: snapshots,
    isLoading: isSnapshotsLoading,
    error: snapshotsError,
  } = useLlamaSnapshot(market ?? undefined, blockchainId, Boolean(blockchainId && market), {
    kind: 'limit',
    limit: RATE_WINDOW,
  })

  const {
    data: marketRates,
    isLoading: isMarketRatesLoading,
    error: marketRatesError,
  } = useMarketRates({ chainId, marketId }, !isMarketMetadataLoading)
  const {
    data: capAndAvailable,
    isLoading: isCapAndAvailableLoading,
    error: capAndAvailableError,
  } = useMarketCapAndAvailable({ chainId, marketId })
  const {
    data: borrowUsdRate,
    isLoading: isBorrowUsdRateLoading,
    error: borrowUsdRateError,
  } = useTokenUsdRate({
    chainId,
    tokenAddress: borrowTokenAddress,
  })
  const {
    data: marketOnChainRewards,
    isLoading: isMarketOnChainRewardsLoading,
    error: marketOnChainRewardsError,
  } = useMarketVaultOnChainRewards({ chainId, marketId }, isLendMarket)

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
  const borrowRateData: BorrowRate = {
    rate: toNumberOrNull(marketRates?.borrowApr),
    averageRate: metrics.averageRate,
    averageCategory: RATE_CATEGORY,
    rebasingYield: metrics.rebasingYield,
    averageRebasingYield: metrics.averageRebasingYield,
    totalBorrowRate: metrics.totalRate,
    totalAverageBorrowRate: metrics.averageTotalRate,
    extraRewards: borrowCampaigns,
  }
  const borrowRate: QueryProp<BorrowRate> = q({
    data: borrowRateData,
    isLoading: isMarketRatesLoading || isSnapshotsLoading || isMarketMetadataLoading,
    error: marketRatesError ?? snapshotsError,
  })
  const lendingSnapshots = isLendMarket ? (snapshots as LendingSnapshot[] | undefined) : undefined
  const rebasingYieldApy = getLatestSnapshotValue(lendingSnapshots, snapshot => snapshot.borrowedToken.rebasingYield)
  const supplyRate = isLendMarket
    ? q({
        data: buildSupplyRate({
          supplyApy: marketRates?.lendApy,
          rebasingYieldApy,
          marketOnChainRewards,
          lendingSnapshots,
          campaigns: supplyCampaigns,
          blockchainId,
          category: RATE_CATEGORY,
        }),
        isLoading:
          isMarketRatesLoading || isSnapshotsLoading || isMarketOnChainRewardsLoading || isMarketMetadataLoading,
        error: marketRatesError ?? snapshotsError ?? marketOnChainRewardsError,
      })
    : undefined

  const availableLiquidity: QueryProp<AvailableLiquidity> = q({
    data: {
      value: toNumberOrNull(capAndAvailable?.available),
      max: toNumberOrNull(capAndAvailable?.totalAssets),
      notional: maybes([toNumberOrNull(capAndAvailable?.available), borrowUsdRate], ([liq, rate]) => liq * rate),
    },
    isLoading: isCapAndAvailableLoading || isMarketMetadataLoading || isBorrowUsdRateLoading,
    error: capAndAvailableError ?? borrowUsdRateError,
  })

  return { borrowRate, supplyRate, availableLiquidity }
}
