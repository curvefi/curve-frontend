import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketCapAndAvailable, useMarketRates, useMarketVaultOnChainRewards } from '@/llamalend/queries/market'
import {
  LAST_MONTH,
  getBorrowRateMetrics,
  getSnapshotBorrowRate,
  getSnapshotCollateralRebasingYieldRate,
} from '@/llamalend/rates.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { useCampaignsByAddress, type CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import type { CrvUsdSnapshot } from '@ui-kit/entities/crvusd-snapshots'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import type { ExtraIncentive } from '@ui-kit/types/market'
import { calculateAverageRates } from '@ui-kit/utils/averageRates'

const AVERAGE_RATE_LABEL = `${LAST_MONTH}D`
const SNAPSHOTS_QUERY_LIMIT = LAST_MONTH

const toNumberOrNull = (value: number | string | null | undefined) => (value == null ? null : Number(value))

export type BorrowRate = {
  rate: number | null | undefined
  averageRate: number | null | undefined
  averageRateLabel: string
  rebasingYield: number | null | undefined
  averageRebasingYield: number | null | undefined
  totalBorrowRate: number | null | undefined
  totalAverageBorrowRate: number | null | undefined
  extraRewards: CampaignPoolRewards[]
  loading: boolean
}

export type SupplyRate = {
  rate: number | null | undefined
  averageRate: number | null | undefined
  averageRateLabel: string
  supplyAprCrvMinBoost: number | null | undefined
  supplyAprCrvMaxBoost: number | null | undefined
  averageSupplyAprCrvMinBoost: number | null | undefined
  averageSupplyAprCrvMaxBoost: number | null | undefined
  rebasingYield: number | null | undefined
  averageRebasingYield: number | null | undefined
  totalSupplyRateMinBoost: number | null | undefined
  totalSupplyRateMaxBoost: number | null | undefined
  totalAverageSupplyRateMinBoost: number | null | undefined
  totalAverageSupplyRateMaxBoost: number | null | undefined
  extraIncentives: ExtraIncentive[]
  averageTotalExtraIncentivesApr: number | null | undefined
  extraRewards: CampaignPoolRewards[]
  loading: boolean
}

export type AvailableLiquidity = {
  value: number | null | undefined
  max: number | null | undefined
  loading: boolean
}

export type PageHeaderData = {
  borrowRate: BorrowRate
  supplyRate?: SupplyRate
  availableLiquidity: AvailableLiquidity
}

type UsePageHeaderParams = {
  chainId: number
  marketId: string
  market: LlamaMarketTemplate | null | undefined
  blockchainId: Chain | undefined
}

const EMPTY_SUPPLY_AVERAGES = {
  lendApy: null,
  rebasingYield: null,
  aprCrvMinBoost: null,
  aprCrvMaxBoost: null,
  extraIncentivesApr: null,
}

/** Sum a base rate with optional additional components, returning null if the base is null */
const sumRates = (base: number | null | undefined, ...components: (number | null | undefined)[]) =>
  base == null ? null : components.reduce<number>((sum, c) => sum + (c ?? 0), base)

function buildBorrowRate(
  borrowApr: number | null,
  snapshots: (LendingSnapshot | CrvUsdSnapshot)[] | undefined,
  campaigns: CampaignPoolRewards[],
  loading: boolean,
): BorrowRate {
  const metrics = getBorrowRateMetrics({
    borrowRate: borrowApr,
    snapshots,
    getBorrowRate: getSnapshotBorrowRate,
    getRebasingYield: getSnapshotCollateralRebasingYieldRate,
  })

  return {
    rate: borrowApr,
    averageRate: metrics.averageRate,
    averageRateLabel: AVERAGE_RATE_LABEL,
    rebasingYield: metrics.rebasingYield,
    averageRebasingYield: metrics.averageRebasingYield,
    totalBorrowRate: metrics.totalRate,
    totalAverageBorrowRate: metrics.averageTotalRate,
    extraRewards: campaigns,
    loading,
  }
}

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
  const averages =
    calculateAverageRates(lendingSnapshots, LAST_MONTH, {
      lendApy: ({ lendApy }) => Number(lendApy) * 100,
      rebasingYield: ({ borrowedToken }) => borrowedToken.rebasingYield,
      aprCrvMinBoost: ({ lendAprCrv0Boost }) => lendAprCrv0Boost,
      aprCrvMaxBoost: ({ lendAprCrvMaxBoost }) => lendAprCrvMaxBoost,
      extraIncentivesApr: ({ extraRewardApr }) => extraRewardApr.reduce((acc, r) => acc + r.rate, 0),
    }) ?? EMPTY_SUPPLY_AVERAGES

  const supplyApy = toNumberOrNull(marketRates?.lendApy)
  const supplyAprCrvMinBoost = marketOnChainRewards?.crvRates?.[0] ?? lendingSnapshots?.[0]?.lendAprCrv0Boost ?? 0
  const supplyAprCrvMaxBoost = marketOnChainRewards?.crvRates?.[1] ?? lendingSnapshots?.[0]?.lendAprCrvMaxBoost ?? 0
  const rebasingYield = lendingSnapshots?.at(-1)?.borrowedToken?.rebasingYield ?? null
  const extraIncentivesTotalApr = marketOnChainRewards?.rewardsApr?.reduce((acc, r) => acc + r.apy, 0) ?? 0

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
    rate: supplyApy,
    averageRate: averages.lendApy ?? null,
    averageRateLabel: AVERAGE_RATE_LABEL,
    supplyAprCrvMinBoost,
    supplyAprCrvMaxBoost,
    averageSupplyAprCrvMinBoost: averages.aprCrvMinBoost ?? null,
    averageSupplyAprCrvMaxBoost: averages.aprCrvMaxBoost ?? null,
    rebasingYield,
    averageRebasingYield: averages.rebasingYield ?? null,
    totalSupplyRateMinBoost: sumRates(supplyApy, rebasingYield, extraIncentivesTotalApr, supplyAprCrvMinBoost),
    totalSupplyRateMaxBoost: sumRates(supplyApy, rebasingYield, extraIncentivesTotalApr, supplyAprCrvMaxBoost),
    totalAverageSupplyRateMinBoost: sumRates(
      averages.lendApy,
      averages.rebasingYield,
      averages.extraIncentivesApr,
      averages.aprCrvMinBoost,
    ),
    totalAverageSupplyRateMaxBoost: sumRates(
      averages.lendApy,
      averages.rebasingYield,
      averages.extraIncentivesApr,
      averages.aprCrvMaxBoost,
    ),
    extraIncentives,
    averageTotalExtraIncentivesApr: averages.extraIncentivesApr ?? null,
    extraRewards: campaigns,
    loading,
  }
}

export const usePageHeader = ({ chainId, marketId, market, blockchainId }: UsePageHeaderParams): PageHeaderData => {
  const lendMarket = market instanceof LendMarketTemplate ? market : undefined
  const mintMarket = market instanceof MintMarketTemplate ? market : undefined
  const isLendMarket = lendMarket != null || (market == null && marketId.startsWith('one-way'))
  const isMarketMetadataLoading = !market

  const controllerAddress = (lendMarket?.addresses.controller ?? mintMarket?.controller) as Address | undefined
  const vaultAddress = lendMarket?.addresses.vault as Address | undefined
  const hasSnapshotParams = Boolean(blockchainId && controllerAddress)

  // Data queries
  const { data: marketRates, isLoading: isMarketRatesLoading } = useMarketRates({ chainId, marketId })
  const { data: capAndAvailable, isLoading: isCapAndAvailableLoading } = useMarketCapAndAvailable({ chainId, marketId })
  const { data: marketOnChainRewards, isLoading: isMarketOnChainRewardsLoading } = useMarketVaultOnChainRewards(
    { chainId, marketId },
    lendMarket != null,
  )

  const { data: controllerCampaigns } = useCampaignsByAddress({ blockchainId, address: controllerAddress })
  const { data: vaultCampaigns } = useCampaignsByAddress({ blockchainId, address: vaultAddress })
  const campaigns = isLendMarket ? [...vaultCampaigns, ...controllerCampaigns] : controllerCampaigns

  const snapshotQuery = {
    blockchainId,
    contractAddress: controllerAddress,
    agg: 'day' as const,
    limit: SNAPSHOTS_QUERY_LIMIT,
  }
  const { data: lendingSnapshots, isLoading: isLendingSnapshotsLoading } = useLendingSnapshots(
    snapshotQuery,
    isLendMarket && hasSnapshotParams,
  )
  const { data: crvUsdSnapshots, isLoading: isCrvUsdSnapshotsLoading } = useCrvUsdSnapshots(
    snapshotQuery,
    !isLendMarket && hasSnapshotParams,
  )

  // Borrow rate
  const borrowSnapshots = isLendMarket ? lendingSnapshots : crvUsdSnapshots
  const isBorrowSnapshotsLoading = isLendMarket ? isLendingSnapshotsLoading : isCrvUsdSnapshotsLoading
  const borrowRate = buildBorrowRate(
    toNumberOrNull(marketRates?.borrowApr),
    borrowSnapshots,
    campaigns,
    isMarketRatesLoading || isBorrowSnapshotsLoading || isMarketMetadataLoading,
  )

  // Supply rate (lend markets only)
  const supplyRate = isLendMarket
    ? buildSupplyRate({
        marketRates,
        marketOnChainRewards,
        lendingSnapshots,
        campaigns,
        blockchainId,
        loading:
          isMarketRatesLoading || isLendingSnapshotsLoading || isMarketOnChainRewardsLoading || isMarketMetadataLoading,
      })
    : undefined

  // Available liquidity
  const availableLiquidity: AvailableLiquidity = {
    value: toNumberOrNull(capAndAvailable?.available),
    max: toNumberOrNull(capAndAvailable?.cap),
    loading: isCapAndAvailableLoading || isMarketMetadataLoading,
  }

  return { borrowRate, supplyRate, availableLiquidity }
}
