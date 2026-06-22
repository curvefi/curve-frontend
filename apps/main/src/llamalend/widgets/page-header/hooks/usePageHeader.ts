import { useSnapshots } from '@/llamalend/features/market-list/hooks/useSnapshots'
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
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
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
import { fakeLoadingQ, fallbackQ, mapQuery, q, Query, type QueryProp, type Range } from '@ui-kit/types/util'
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
  apiMarket,
  marketRates,
  marketType,
  snapshot,
  marketQuery,
  campaigns,
}: {
  apiMarket: QueryProp<LlamaMarket>
  marketRates: QueryProp<MarketRates>
  marketType: LlamaMarketType
  marketQuery: QueryProp<LlamaMarketTemplate>
  snapshot: QueryProp<LendingSnapshot[] | CrvUsdSnapshot[]>
  campaigns: CampaignRewards[]
}) => {
  const borrowCampaigns = useFilteredRewards(campaigns, marketType, MarketRateType.Borrow)

  const onChainBorrowRate = combineQueries([marketRates, snapshot, marketQuery], ({ borrowApr }, snapshots) => {
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

  const useApiMarket = !!apiMarket.data && !marketQuery.data
  const { averageRate: averageApr, averageTotalBorrowRate: totalAverageBorrowApr } = useSnapshots(
    apiMarket.data,
    { type: MarketRateType.Borrow, category: RATE_CATEGORY },
    useApiMarket,
  )
  const apiBorrowRate = mapQuery(apiMarket, d => ({
    rate: d.rates.borrowApr,
    averageRate: averageApr,
    averageCategory: 'llamalend.marketList.rate' as const,
    rebasingYield: d.rates.borrowApr,
    totalBorrowRate: d.rates.borrowTotalApr,
    totalAverageBorrowRate: totalAverageBorrowApr,
    extraRewards: d.rewards,
  }))

  return fallbackQ(onChainBorrowRate, apiBorrowRate)
}

export const useSupplyRate = ({
  useApiMarket,
  marketRates,
  snapshot,
  marketQuery,
  chainId,
  blockchainId,
  apiMarket,
  marketType,
  campaigns,
}: {
  chainId: number
  useApiMarket: boolean
  marketRates: QueryProp<MarketRates>
  snapshot: QueryProp<LendingSnapshot[] | CrvUsdSnapshot[]>
  marketQuery: QueryProp<LlamaMarketTemplate>
  blockchainId: Chain | undefined
  apiMarket: QueryProp<LlamaMarket>
  marketType: LlamaMarketType
  campaigns: CampaignRewards[]
}) => {
  const marketId = marketQuery.data?.id
  const enabled = marketType === LlamaMarketType.Lend
  const apiSupplySnapshots = useSnapshots<LendingSnapshot>(
    apiMarket.data,
    { type: MarketRateType.Supply, category: RATE_CATEGORY },
    useApiMarket && enabled,
  )
  const onChainRewards = useMarketVaultOnChainRewards({ chainId, marketId }, enabled)

  const supplyCampaigns = useFilteredRewards(campaigns, marketType, MarketRateType.Supply)
  const apiSupplyCampaigns = useFilteredRewards(apiMarket.data?.rewards ?? [], marketType, MarketRateType.Supply)

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
  const apiSupplyRate = mapQuery(apiMarket, ({ rates, assets }) =>
    buildSupplyRate({
      supplyApy: rates.lendApy,
      rebasingYieldApy: assets.borrowed.rebasingYield,
      marketOnChainRewards: {
        crvRates:
          maybes([rates.lendCrvAprUnboosted, rates.lendCrvAprBoosted], ([min, max]) => [min, max] as Range<number>) ??
          null,
        rewardsApr: rates.incentives.map(({ percentage, title, address }) => ({
          apy: percentage,
          symbol: title,
          tokenAddress: address,
        })),
      },
      lendingSnapshots: apiSupplySnapshots.snapshots ?? undefined,
      campaigns: apiSupplyCampaigns,
      blockchainId,
      category: 'llamalend.marketList.rate',
    }),
  )
  return enabled ? fallbackQ(onChainSupplyRate, apiSupplyRate) : undefined
}

export const useAvailableLiquidity = ({
  chainId,
  marketQuery: { data: market },
  apiMarket,
}: {
  chainId: number
  marketQuery: QueryProp<LlamaMarketTemplate>
  apiMarket: QueryProp<LlamaMarket>
}) => {
  const borrowTokenAddress = getTokens(market, apiMarket.data)?.borrowToken.address
  const capAndAvailable = useMarketCapAndAvailable({ chainId, marketId: market?.id })
  const borrowUsdRate = useTokenUsdRate({ chainId, tokenAddress: borrowTokenAddress })
  const marketQuery = fakeLoadingQ(market) // todo: use a proper query, see #2729

  const onChainLiquidity = combineQueries(
    [borrowUsdRate, capAndAvailable, marketQuery],
    (borrowUsdRate, { available, totalAssets }) => ({
      value: available,
      max: totalAssets,
      notional: maybes([available, borrowUsdRate], ([liq, rate]) => decimalMultiply(liq, rate)),
    }),
  )
  const apiLiquidity = combineQueries([apiMarket, borrowUsdRate], (d, rate) => ({
    value: d.liquidityUsd / rate,
    max: d.debtCeiling,
    notional: d.liquidityUsd,
  }))
  return fallbackQ(onChainLiquidity, apiLiquidity)
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
  apiMarket,
  marketType,
}: {
  chainId: number
  market: LlamaMarketTemplate | null | undefined
  blockchainId: Chain | undefined
  apiMarket: QueryProp<LlamaMarket>
  marketType: LlamaMarketType
}) => {
  const vaultAddress = getVaultAddress(market, apiMarket.data)
  const controllerAddress = getControllerAddress(market, apiMarket.data)
  const snapshot = q(
    useLlamaSnapshot({ marketType, controllerAddress, blockchainId, range: { kind: 'limit', limit: RATE_WINDOW } }),
  )
  const marketRates = q(useMarketRates({ chainId, marketId: market?.id }))
  const campaigns = useCampaigns({ blockchainId, controllerAddress, vaultAddress, marketType })
  const marketQuery = fakeLoadingQ(market ?? undefined) // todo: use a proper query, see #2729
  const useApiMarket = !!apiMarket.data && !marketQuery.data

  return {
    borrowRate: useBorrowRate({ marketRates, marketQuery, campaigns, marketType, apiMarket, snapshot }),
    supplyRate: useSupplyRate({
      marketRates,
      marketQuery,
      apiMarket,
      useApiMarket,
      snapshot,
      marketType,
      chainId,
      blockchainId,
      campaigns,
    }),
    availableLiquidity: useAvailableLiquidity({ chainId, marketQuery, apiMarket }),
  }
}

type UsePageHeaderResult = ReturnType<typeof usePageHeader>
export type BorrowRate = NonNullable<UsePageHeaderResult['borrowRate']['data']>
export type SupplyRate = ReturnType<typeof buildSupplyRate>
export type AvailableLiquidity = UsePageHeaderResult['availableLiquidity']['data']
