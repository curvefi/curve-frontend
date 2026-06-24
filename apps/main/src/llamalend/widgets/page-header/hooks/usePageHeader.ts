import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { getControllerAddress, getTokens, getVaultAddress } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import {
  type MarketRates,
  useMarketCapAndAvailable,
  useMarketRates,
  useMarketVaultOnChainRewards,
} from '@/llamalend/queries/market'
import {
  aprToApy,
  formatSupplyExtraIncentives,
  getBorrowRateMetrics,
  getLatestSnapshotValue,
  getSnapshotBorrowApr,
  getSnapshotCollateralRebasingYieldApr,
  getSupplyApyAverageMetrics,
  getSupplyApyMetrics,
  sumCampaignsApr,
  sumCampaignsApy,
  sumOnChainExtraIncentivesApy,
  toNumberOrNull,
} from '@/llamalend/rates.utils'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { maybes, notFalsyArray } from '@primitives/objects.utils'
import { type CampaignRewards, useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import type { CrvUsdSnapshot } from '@ui-kit/entities/crvusd-snapshots'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import { combineQueries } from '@ui-kit/lib'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import { fakeLoadingQ, q, Query, type QueryProp, type Range } from '@ui-kit/types/util'
import { AVERAGE_CATEGORIES, type AverageCategory, decimalMultiply } from '@ui-kit/utils'

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
}) {
  const { window: daysBack } = AVERAGE_CATEGORIES[category]
  const supplyMetrics = getSupplyApyMetrics({
    supplyApy: toNumberOrNull(supplyApy),
    rebasingYieldApy: toNumberOrNull(rebasingYieldApy),
    crvBoostApr: marketOnChainRewards?.crvRates,
    extraIncentivesApy: sumOnChainExtraIncentivesApy(marketOnChainRewards?.rewardsApr),
    campaignsApy: sumCampaignsApy(campaigns),
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

export const useBorrowRate = ({
  marketRates,
  marketType,
  snapshot,
  marketQuery,
  campaigns,
}: {
  marketRates: QueryProp<MarketRates>
  marketType: LlamaMarketType
  marketQuery: QueryProp<LlamaMarketTemplate>
  snapshot: QueryProp<LendingSnapshot[] | CrvUsdSnapshot[]>
  campaigns: CampaignRewards[]
}) => {
  const borrowCampaigns = useFilteredRewards(campaigns, marketType, MarketRateType.Borrow)

  return combineQueries([marketRates, snapshot, marketQuery], ({ borrowApr }, snapshots) => {
    const { averageRate, averageRebasingYield, averageTotalRate, rebasingYield, totalRate } = getBorrowRateMetrics({
      borrowRate: toNumberOrNull(borrowApr),
      campaignsRate: sumCampaignsApr(borrowCampaigns),
      snapshots,
      getBorrowRate: getSnapshotBorrowApr,
      getRebasingYield: getSnapshotCollateralRebasingYieldApr,
      daysBack: RATE_WINDOW,
    })
    return {
      rate: toNumberOrNull(borrowApr),
      averageRate,
      averageCategory: RATE_CATEGORY,
      rebasingYield,
      averageRebasingYield,
      totalBorrowRate: totalRate,
      totalAverageBorrowRate: averageTotalRate,
      extraRewards: borrowCampaigns,
    }
  })
}

export const useSupplyRate = ({
  marketRates,
  snapshot,
  marketQuery,
  chainId,
  blockchainId,
  marketType,
  campaigns,
}: {
  chainId: number
  marketRates: QueryProp<MarketRates>
  snapshot: QueryProp<LendingSnapshot[] | CrvUsdSnapshot[]>
  marketQuery: QueryProp<LlamaMarketTemplate>
  blockchainId: Chain | undefined
  marketType: LlamaMarketType
  campaigns: CampaignRewards[]
}) => {
  const marketId = marketQuery.data?.id
  const enabled = marketType === LlamaMarketType.Lend
  const onChainRewards = useMarketVaultOnChainRewards({ chainId, marketId }, enabled)
  const supplyCampaigns = useFilteredRewards(campaigns, marketType, MarketRateType.Supply)

  const onChainSupplyRate = combineQueries(
    [marketRates, snapshot as Query<LendingSnapshot[]>, onChainRewards, marketQuery],
    (marketRates, lendingSnapshots, marketOnChainRewards) =>
      buildSupplyRate({
        supplyApy: marketRates?.lendApy,
        rebasingYieldApy: getLatestSnapshotValue(lendingSnapshots, snapshot => snapshot.borrowedToken.rebasingYield),
        marketOnChainRewards,
        lendingSnapshots,
        campaigns: supplyCampaigns,
        blockchainId,
        category: RATE_CATEGORY,
      }),
  )

  return enabled ? onChainSupplyRate : undefined
}

export const useAvailableLiquidity = ({
  chainId,
  marketQuery: { data: market },
}: {
  chainId: number
  marketQuery: QueryProp<LlamaMarketTemplate>
}) => {
  const borrowTokenAddress = getTokens(market)?.borrowToken.address
  const capAndAvailable = useMarketCapAndAvailable({ chainId, marketId: market?.id })
  const borrowUsdRate = useTokenUsdRate({ chainId, tokenAddress: borrowTokenAddress })
  const marketQuery = fakeLoadingQ(market) // todo: use a proper query, see #2729
  return combineQueries([borrowUsdRate, capAndAvailable, marketQuery], (borrowUsdRate, { available, totalAssets }) => ({
    value: available,
    max: totalAssets,
    usdRate: borrowUsdRate,
    notional: maybes([available, borrowUsdRate], ([liq, rate]) => decimalMultiply(liq, rate)),
  }))
}

function useCampaigns({
  blockchainId,
  controllerAddress,
  vaultAddress,
  marketType,
}: {
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
  vaultAddress: Address | null | undefined
  marketType: LlamaMarketType
}) {
  const { data: controllerCampaigns } = useCampaignsByAddress({ blockchainId, address: controllerAddress })
  const { data: vaultCampaigns } = useCampaignsByAddress({ blockchainId, address: vaultAddress })
  return marketType === LlamaMarketType.Lend ? [...vaultCampaigns, ...controllerCampaigns] : controllerCampaigns
}

export const usePageHeader = ({
  chainId,
  market,
  blockchainId,
  marketType,
}: {
  chainId: number
  market: LlamaMarketTemplate | null | undefined
  blockchainId: Chain | undefined
  marketType: LlamaMarketType
}) => {
  const vaultAddress = getVaultAddress(market)
  const controllerAddress = getControllerAddress(market)
  const snapshot = q(
    useLlamaSnapshot({ marketType, controllerAddress, blockchainId, range: { kind: 'limit', limit: RATE_WINDOW } }),
  )
  const marketRates = q(useMarketRates({ chainId, marketId: market?.id }))
  const campaigns = useCampaigns({ blockchainId, controllerAddress, vaultAddress, marketType })
  const marketQuery = fakeLoadingQ(market ?? undefined) // todo: use a proper query, see #2729

  return {
    borrowRate: useBorrowRate({ marketRates, marketQuery, campaigns, marketType, snapshot }),
    supplyRate: useSupplyRate({
      marketRates,
      marketQuery,
      snapshot,
      marketType,
      chainId,
      blockchainId,
      campaigns,
    }),
    availableLiquidity: useAvailableLiquidity({ chainId, marketQuery }),
  }
}

type UsePageHeaderResult = ReturnType<typeof usePageHeader>
export type BorrowRate = NonNullable<UsePageHeaderResult['borrowRate']['data']>
export type SupplyRate = ReturnType<typeof buildSupplyRate>
export type AvailableLiquidity = UsePageHeaderResult['availableLiquidity']['data']
