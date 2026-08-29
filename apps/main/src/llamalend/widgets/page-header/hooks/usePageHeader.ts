import { useMarketContext } from '@/llamalend/features/market-context'
import { useMarketRateHistory } from '@/llamalend/features/market-list/hooks/useMarketRateHistory'
import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { getControllerAddress, getTokens, getVaultAddress } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import {
  type MarketRates,
  useMarketCapAndAvailable,
  useMarketRates,
  useMarketVaultOnChainRewards,
  useMarketSnapshots,
} from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import {
  formatSupplyExtraIncentives,
  getCampaignAprs,
  getBorrowRateMetrics,
  getLatestSnapshotValue,
  getOnChainExtraIncentiveAprs,
  getSnapshotBorrowApr,
  getSnapshotCollateralRebasingYieldApr,
  getSupplyRateAverageMetrics,
  getSupplyRateMetrics,
  sumCampaignsApr,
  toNumberOrNull,
} from '@/llamalend/rates.utils'
import type { Chain } from '@curvefi/prices-api'
import { type CampaignRewards, useCampaignsByAddress } from '@evm-ui/entities/campaigns'
import type { CrvUsdSnapshot } from '@evm-ui/entities/crvusd-snapshots'
import type { LendingSnapshot } from '@evm-ui/entities/lending-snapshots'
import { useAprToApy } from '@evm-ui/hooks/useAprToApy'
import { combineQueries } from '@evm-ui/lib'
import { useTokenUsdRate } from '@evm-ui/lib/model/entities/token-usd-rate'
import { MarketType, MarketRateType } from '@evm-ui/types/market'
import { fallbackQ, mapQuery, q, Query, type QueryProp, type Range } from '@evm-ui/types/util'
import { AVERAGE_CATEGORIES, type AverageCategory, decimal, decimalMultiply } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import { maybe, maybes, notFalsyArray } from '@primitives/objects.utils'

const RATE_CATEGORY: AverageCategory = 'llamalend.market.rate'

const { window: RATE_WINDOW } = AVERAGE_CATEGORIES[RATE_CATEGORY]

function buildSupplyRate({
  supplyApr,
  rebasingYieldApr,
  marketOnChainRewards,
  lendingSnapshots,
  campaigns,
  blockchainId,
  category,
  convertRate,
}: {
  supplyApr?: number | string | null
  rebasingYieldApr?: number | string | null
  marketOnChainRewards:
    | { crvRates?: Range<number> | null; rewardsApr?: { apr: number; symbol: string; tokenAddress: string }[] }
    | undefined
  lendingSnapshots: LendingSnapshot[] | undefined
  campaigns: CampaignRewards[]
  blockchainId: Chain | undefined
  category: AverageCategory
  convertRate: ReturnType<typeof useAprToApy>
}) {
  const { window: daysBack } = AVERAGE_CATEGORIES[category]
  const supplyMetrics = getSupplyRateMetrics({
    supplyApr: toNumberOrNull(supplyApr),
    rebasingYieldApr: toNumberOrNull(rebasingYieldApr),
    crvBoostApr: marketOnChainRewards?.crvRates,
    extraIncentivesApr: getOnChainExtraIncentiveAprs(marketOnChainRewards?.rewardsApr),
    campaignsApr: getCampaignAprs(campaigns),
    convertRate,
  })
  const supplyAverageMetrics = getSupplyRateAverageMetrics({
    snapshots: lendingSnapshots,
    daysBack,
    convertRate,
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
              percentage: convertRate(reward.apr),
              blockchainId,
              address: reward.tokenAddress,
            })),
          ),
          baseRate: supplyMetrics.supplyRateCrvMinBoost,
        }),
    ),
    extraRewards: campaigns,
  }
}

const useBorrowRate = ({
  apiMarket,
  marketRates,
  marketType,
  snapshot,
  marketQuery,
  campaigns,
}: {
  apiMarket: QueryProp<LlamaMarket>
  marketRates: QueryProp<MarketRates>
  marketType: MarketType
  marketQuery: QueryProp<MarketTemplate>
  snapshot: QueryProp<LendingSnapshot[] | CrvUsdSnapshot[]>
  campaigns: CampaignRewards[]
}) => {
  const borrowCampaigns = useFilteredRewards(campaigns, marketType, MarketRateType.Borrow)

  const onChainBorrowRate = combineQueries([marketRates, snapshot, marketQuery], ({ borrowApr }, snapshots) => {
    const { averageRate, averageRebasingYieldApr, averageTotalRate, rebasingYieldApr, totalRate } = getBorrowRateMetrics({
      borrowRate: toNumberOrNull(borrowApr),
      campaignsRate: sumCampaignsApr(borrowCampaigns),
      snapshots,
      getBorrowRate: getSnapshotBorrowApr,
      getRebasingYieldApr: getSnapshotCollateralRebasingYieldApr,
      daysBack: RATE_WINDOW,
    })
    return {
      rate: toNumberOrNull(borrowApr),
      averageRate,
      averageCategory: RATE_CATEGORY,
      rebasingYieldApr,
      averageRebasingYieldApr,
      totalBorrowRate: totalRate,
      totalAverageBorrowRate: averageTotalRate,
      extraRewards: borrowCampaigns,
    }
  })

  const useApiMarket = !!apiMarket.data && !marketQuery.data
  const { averageRate: averageApr, averageTotalBorrowRate: totalAverageBorrowApr } = useMarketRateHistory(
    apiMarket.data,
    { type: MarketRateType.Borrow, category: RATE_CATEGORY },
    useApiMarket,
  )
  const apiBorrowRate = mapQuery(apiMarket, d => ({
    rate: d.rates.borrowApr,
    averageRate: averageApr,
    averageCategory: RATE_CATEGORY,
    rebasingYieldApr: d.assets.collateral.rebasingYieldApr,
    totalBorrowRate: d.rates.borrowTotalApr,
    totalAverageBorrowRate: totalAverageBorrowApr,
    extraRewards: borrowCampaigns,
  }))

  return fallbackQ(onChainBorrowRate, apiBorrowRate)
}

const useSupplyRate = ({
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
  marketQuery: QueryProp<MarketTemplate>
  blockchainId: Chain | undefined
  apiMarket: QueryProp<LlamaMarket>
  marketType: MarketType
  campaigns: CampaignRewards[]
}) => {
  const convertRate = useAprToApy()
  const marketId = marketQuery.data?.id
  const enabled = marketType === MarketType.Lend
  const apiSupplySnapshots = useMarketRateHistory<LendingSnapshot>(
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
        supplyApr: marketRates?.lendApr,
        rebasingYieldApr: getLatestSnapshotValue(
          lendingSnapshots,
          snapshot => snapshot.borrowedToken.rebasingYieldApr,
        ),
        marketOnChainRewards,
        lendingSnapshots,
        campaigns: supplyCampaigns,
        blockchainId,
        category: RATE_CATEGORY,
        convertRate,
      }),
  )
  const apiSupplyRate = mapQuery(apiMarket, ({ rates, assets }) =>
    buildSupplyRate({
      supplyApr: rates.lendApr,
      rebasingYieldApr: assets.borrowed.rebasingYieldApr,
      marketOnChainRewards: {
        crvRates:
          maybes([rates.lendCrvAprUnboosted, rates.lendCrvAprBoosted], (min, max) => [min, max] as Range<number>) ??
          null,
        rewardsApr: rates.incentives.map(({ percentage, title, address }) => ({
          apr: percentage,
          symbol: title,
          tokenAddress: address,
        })),
      },
      lendingSnapshots: apiSupplySnapshots.snapshots ?? undefined,
      campaigns: apiSupplyCampaigns,
      blockchainId,
      category: RATE_CATEGORY,
      convertRate,
    }),
  )
  return enabled ? fallbackQ(onChainSupplyRate, apiSupplyRate) : undefined
}

const useAvailableLiquidity = ({
  chainId,
  marketQuery,
  apiMarket,
}: {
  chainId: number
  marketQuery: QueryProp<MarketTemplate>
  apiMarket: QueryProp<LlamaMarket>
}) => {
  const { data: market } = marketQuery
  const borrowTokenAddress = getTokens(market, apiMarket.data)?.borrowToken.address
  const capAndAvailable = useMarketCapAndAvailable({ chainId, marketId: market?.id })
  const borrowUsdRate = useTokenUsdRate({ chainId, tokenAddress: borrowTokenAddress })

  const onChainLiquidity = combineQueries([capAndAvailable, marketQuery], ({ available, totalAssets }) => ({
    value: available,
    total: totalAssets,
  }))
  const value = fallbackQ(
    mapQuery(onChainLiquidity, d => d.value),
    combineQueries([apiMarket, borrowUsdRate], (d, rate) => d.liquidityUsd / rate),
  )
  const total = fallbackQ(
    mapQuery(onChainLiquidity, d => d.total),
    mapQuery(apiMarket, d => ({ Lend: d.assets.collateral.balance, Mint: d.debtCeiling })[d.type]),
  )
  return {
    value,
    total,
    usdRate: q(borrowUsdRate),
    notional: combineQueries([value, borrowUsdRate], (value, rate) =>
      maybe(decimal(value), value => decimalMultiply(value, rate)),
    ),
  }
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
  marketType: MarketType
}) {
  const { data: controllerCampaigns } = useCampaignsByAddress({ blockchainId, address: controllerAddress })
  const { data: vaultCampaigns } = useCampaignsByAddress({ blockchainId, address: vaultAddress })
  return marketType === MarketType.Lend ? [...vaultCampaigns, ...controllerCampaigns] : controllerCampaigns
}

export const usePageHeader = () => {
  const { chainId, blockchainId, market, marketQuery, apiMarket, marketType } = useMarketContext()
  const vaultAddress = getVaultAddress(market, apiMarket.data)
  const controllerAddress = getControllerAddress(market, apiMarket.data)
  const snapshot = q(
    useMarketSnapshots({
      marketType,
      controllerAddress,
      blockchainId,
      range: { kind: 'limit', limit: RATE_WINDOW },
    }),
  )
  const marketRates = q(useMarketRates({ chainId, marketId: market?.id }))
  const campaigns = useCampaigns({ blockchainId, controllerAddress, vaultAddress, marketType })
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
export type AvailableLiquidity = UsePageHeaderResult['availableLiquidity']
