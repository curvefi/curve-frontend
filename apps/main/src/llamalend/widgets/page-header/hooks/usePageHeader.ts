import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { getControllerAddress } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import { useMarketCapAndAvailable, useMarketRates, useMarketVaultOnChainRewards } from '@/llamalend/queries/market'
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
import { type CampaignRewards, useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import { combineQueries } from '@ui-kit/lib'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import { fakeLoadingQ, Query, QueryProp, type Range } from '@ui-kit/types/util'
import { AVERAGE_CATEGORIES, type AverageCategory, CRVUSD_ADDRESS, decimalMultiply } from '@ui-kit/utils'

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
  marketQuery,
  blockchainId,
}: {
  chainId: number
  marketId: string | undefined
  marketQuery: QueryProp<LlamaMarketTemplate>
  blockchainId: Chain | undefined
}) => {
  const market = marketQuery.data
  const isLendMarket = market instanceof LendMarketTemplate
  const vaultAddress = (isLendMarket ? market.addresses.vault : undefined) as Address | undefined
  const controllerAddress = getControllerAddress(market)
  const borrowTokenAddress = (isLendMarket ? market.addresses.borrowed_token : CRVUSD_ADDRESS) as Address | undefined
  const marketType = isLendMarket ? LlamaMarketType.Lend : LlamaMarketType.Mint

  const snapshot = useLlamaSnapshot({ market, blockchainId, range: { kind: 'limit', limit: RATE_WINDOW } })
  const marketRates = useMarketRates({ chainId, marketId })
  const capAndAvailable = useMarketCapAndAvailable({ chainId, marketId })
  const borrowUsdRate = useTokenUsdRate({ chainId, tokenAddress: borrowTokenAddress })
  const onChainRewards = useMarketVaultOnChainRewards({ chainId, marketId }, isLendMarket)

  const { data: controllerCampaigns } = useCampaignsByAddress({ blockchainId, address: controllerAddress })
  const { data: vaultCampaigns } = useCampaignsByAddress({ blockchainId, address: vaultAddress })
  const campaigns = isLendMarket ? [...vaultCampaigns, ...controllerCampaigns] : controllerCampaigns
  const borrowCampaigns = useFilteredRewards(campaigns, marketType, MarketRateType.Borrow)
  const supplyCampaigns = useFilteredRewards(campaigns, marketType, MarketRateType.Supply)
  const marketQuery = fakeLoadingQ(market) // todo: use a proper query, see #2729

  return {
    borrowRate: combineQueries([marketRates, snapshot, marketQuery], ({ borrowApr }, snapshots) => {
      const { averageRate, averageRebasingYield, averageTotalRate, rebasingYield, totalRate } = getBorrowRateMetrics({
        borrowRate: toNumberOrNull(borrowApr),
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
    }),
    supplyRate: isLendMarket
      ? combineQueries(
          [marketRates, snapshot as Query<LendingSnapshot[]>, onChainRewards, marketQuery],
          (marketRates, lendingSnapshots, marketOnChainRewards) =>
            buildSupplyRate({
              supplyApy: marketRates?.lendApy,
              rebasingYieldApy: getLatestSnapshotValue(
                lendingSnapshots,
                snapshot => snapshot.borrowedToken.rebasingYield,
              ),
              marketOnChainRewards,
              lendingSnapshots,
              campaigns: supplyCampaigns,
              blockchainId,
              category: RATE_CATEGORY,
            }),
        )
      : undefined,
    availableLiquidity: combineQueries(
      [borrowUsdRate, capAndAvailable, marketQuery],
      (borrowUsdRate, { available, totalAssets }) => ({
        value: available,
        max: totalAssets,
        notional: maybes([available, borrowUsdRate], ([liq, rate]) => decimalMultiply(liq, rate)),
      }),
    ),
  }
}

type UsePageHeaderResult = ReturnType<typeof usePageHeader>
export type BorrowRate = NonNullable<UsePageHeaderResult['borrowRate']['data']>
export type SupplyRate = ReturnType<typeof buildSupplyRate>
export type AvailableLiquidity = UsePageHeaderResult['availableLiquidity']['data']
