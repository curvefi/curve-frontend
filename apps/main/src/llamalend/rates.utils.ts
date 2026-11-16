import { sumBy } from 'lodash'
import { getAddress } from 'viem'
import {
  type CollateralYields,
  getEstimatedNetBorrowApr,
  getSnapshotCollateralYields,
  sumCollateralYields,
} from '@/llamalend/collateral-yields'
import type { MarketYields } from '@/llamalend/equity-leverage.utils'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { CrvUsdSnapshot } from '@evm-ui/queries/crvusd-snapshots.query'
import type { LendingSnapshot } from '@evm-ui/queries/lending-snapshots.query'
import { type ExtraIncentive, MarketRateType, MarketType } from '@evm-ui/types/market'
import { MAINNET_CRV_ADDRESS } from '@evm-ui/utils'
import { calculateAverageRates, type WithTimestamp } from '@evm-ui/utils/averageRates'
import type { Address } from '@primitives/address.utils'
import { toArray } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { type Nullish, maybe, maybes, notFalsy, recordValues } from '@primitives/objects.utils'
import type { CampaignRewards } from '@ui/features/campaigns/types'
import { combineQueries } from '@ui/features/queries/combine'
import { DISABLED_Q, mapQuery, type QueryProp, type Range } from '@ui/features/queries/util'
import { decimal, ZERO } from '@ui/lib/decimal'
import { aprToApy } from '@ui/lib/rates.utils'

/** Returns the rate tabs available for a market and the tab selected by default */
export const getMarketRateTypeTabConfig = ({
  marketType,
  rateType,
}: {
  marketType: MarketType
  rateType: MarketRateType
}) =>
  (
    ({
      [MarketType.Lend]: { types: recordValues(MarketRateType), defaultValue: rateType },
      [MarketType.Mint]: { types: toArray(MarketRateType.Borrow), defaultValue: MarketRateType.Borrow },
    }) satisfies Record<MarketType, { types: readonly MarketRateType[]; defaultValue: MarketRateType }>
  )[marketType]

/** Annualized return on equity at the given leverage. Input APYs and output are percentage. */
export const getReturnOnEquity = (
  leverage: number | Nullish,
  collateralApy: number | Nullish,
  borrowApy: number | Nullish,
): number | undefined =>
  // Total collateral / equity = leverage, so debt / equity = leverage - 1.
  maybes([leverage, collateralApy, borrowApy], (lev, colApy, borApy) =>
    lev < 1 ? undefined : lev * colApy - (lev - 1) * borApy,
  )

export type BorrowRates = { borrowApr?: Decimal; borrowApy?: Decimal }

export const formatReturnOnEquity = (
  leverage: QueryProp<Decimal | null> | undefined,
  rates: QueryProp<BorrowRates | null> | undefined,
  collateralApy: QueryProp<number | null>,
) =>
  mapQuery(
    combineQueries([leverage ?? DISABLED_Q, rates ?? DISABLED_Q, collateralApy], (leverage, rates, collateralApy) =>
      maybes([leverage, collateralApy, rates?.borrowApy], (leverage, collateralApy, borrowApy) =>
        getReturnOnEquity(+leverage, collateralApy, +borrowApy),
      ),
    ),
    returnOnEquity => formatNumber(returnOnEquity, 'percent.rate'),
  )

export const getSnapshotBorrowApr = ({ borrowApr }: LendingSnapshot | CrvUsdSnapshot) => borrowApr
export const getSnapshotBorrowedRebasingYieldApr = (snapshot: LendingSnapshot | CrvUsdSnapshot) =>
  ('borrowedToken' in snapshot ? snapshot.borrowedToken : snapshot.stablecoinToken).rebasingYieldApr

export const getLatestSnapshotValue = <TSnapshot extends WithTimestamp, TValue>(
  snapshots: TSnapshot[] | undefined,
  getValue: (snapshot: TSnapshot) => TValue | Nullish,
) => {
  const latest = snapshots?.at(-1)
  return latest ? (getValue(latest) ?? null) : null
}

/** Averages of the borrow APR and of the estimated net borrow APR, which leaves the campaigns out. */
export const getAverageBorrowRates = (
  snapshots: (LendingSnapshot | CrvUsdSnapshot)[] | undefined,
  daysBack: number,
) => {
  const averages = calculateAverageRates(snapshots, daysBack, {
    rate: getSnapshotBorrowApr,
    totalRate: snapshot => getEstimatedNetBorrowApr(snapshot.borrowApr, getSnapshotCollateralYields(snapshot), null),
  })
  return { averageRate: averages?.rate ?? null, totalAverageBorrowRate: averages?.totalRate ?? null }
}

/** Sum a base rate with optional additional components, returning null if the base is null */
const sumRates = (base: number | Nullish, ...components: (number | Nullish)[]) =>
  maybe(base, base => components.reduce<number>((sum, c) => sum + (c ?? 0), base)) ?? null

export const toNumberOrNull = (value: number | string | Nullish) => maybe(value, value => Number(value)) ?? null

type OnChainSupplyRewardApr = { apy: number; symbol: string; tokenAddress: string }

/** Null without incentives, as sumBy returns 0 for empty arrays */
export const sumExtraIncentivesApy = (aprs: number[]) =>
  aprs.length ? sumBy(aprs, apr => aprToApy(apr, 'llamalend.rewards')) : null

export const sumOnChainExtraIncentivesApy = (rewardsApr: OnChainSupplyRewardApr[] | undefined) =>
  sumExtraIncentivesApy((rewardsApr ?? []).map(({ apy }) => apy))

/** The CRV reward APR at the boost of the user */
export const getUserBoostApr = (crvApr: number, boost: Decimal | number) => crvApr * +boost

export const sumCampaignsApr = (campaigns: CampaignRewards[] | undefined) =>
  campaigns && campaigns.length > 0
    ? sumBy(
        campaigns.filter(c => c.reward?.type === 'apr'),
        c => c.reward?.value ?? 0,
      )
    : null

type MarketCampaignAddresses = {
  controllerAddress: Address | Nullish
  vaultAddress: Address | Nullish
  ammAddress: Address | Nullish
}

export const getSupplyCampaigns = (rewards: CampaignRewards[]) => rewards.filter(({ action }) => action === 'supply')

/** Campaigns of a market, from the contracts that reward its market type */
export const getMarketCampaigns = (
  campaigns: Record<string, CampaignRewards[]>,
  { marketType, ...addresses }: MarketCampaignAddresses & { marketType: MarketType },
) =>
  notFalsy(
    ...(
      {
        [MarketType.Lend]: ({ vaultAddress, controllerAddress }) => [vaultAddress, controllerAddress],
        [MarketType.Mint]: ({ controllerAddress, ammAddress }) => [controllerAddress, ammAddress],
      } satisfies Record<MarketType, (addresses: MarketCampaignAddresses) => (Address | Nullish)[]>
    )[marketType](addresses),
  ).flatMap(address => campaigns[getAddress(address)] ?? [])

/** No collateral yield means no looped APR; no borrowed-token yield or no campaign counts as 0%. */
const toMarketYields = (
  collateralYields: CollateralYields,
  borrowedYieldApr: number | Nullish,
  campaigns: CampaignRewards[],
): MarketYields => ({
  collateralYieldApr: decimal(sumCollateralYields(collateralYields)) ?? null,
  borrowedYieldApr: decimal(borrowedYieldApr) ?? ZERO,
  borrowRewardsApr: decimal(sumCampaignsApr(campaigns.filter(c => c.action === 'borrow'))) ?? ZERO,
})

/** Collateral yields, the borrowed token yield of the latest snapshot and the borrow campaign rewards of a market. */
export const getMarketYields = (
  collateralYields: CollateralYields,
  snapshots: (LendingSnapshot | CrvUsdSnapshot)[],
  campaigns: Record<string, CampaignRewards[]>,
  addresses: MarketCampaignAddresses & { marketType: MarketType },
): MarketYields =>
  toMarketYields(
    collateralYields,
    getLatestSnapshotValue(snapshots, getSnapshotBorrowedRebasingYieldApr),
    getMarketCampaigns(campaigns, addresses),
  )

/** Yields and borrow campaign rewards of a market in the market list. */
export const getMarketListYields = ({
  collateralYields,
  assets,
  rewards,
}: Pick<LlamaMarket, 'collateralYields' | 'assets' | 'rewards'>) =>
  toMarketYields(collateralYields, assets.borrowed.rebasingYieldApr, rewards)

export const sumCampaignsApy = (campaigns: CampaignRewards[] | undefined) =>
  campaigns && campaigns.length > 0
    ? sumBy(
        campaigns.filter(c => c.reward?.type === 'apr'),
        c => aprToApy(c.reward?.value ?? 0, 'llamalend.rewards'),
      )
    : null

export const formatSupplyExtraIncentives = ({
  incentives,
  baseRate,
  userRate,
  userBoost,
}: {
  incentives: ExtraIncentive[]
  baseRate?: number | Nullish
  userRate?: number | Nullish
  userBoost?: Decimal | Nullish
}): ExtraIncentive[] =>
  notFalsy(
    baseRate && { title: 'CRV', percentage: baseRate, address: MAINNET_CRV_ADDRESS, blockchainId: 'ethereum' },
    userRate &&
      baseRate == null && {
        title: maybe(userBoost, b => `CRV (${formatNumber(b, 'multiplier')} veCRV Boost)`) ?? '',
        percentage: userRate,
        address: MAINNET_CRV_ADDRESS,
        blockchainId: 'ethereum',
      },
    ...incentives.map(incentive => incentive.percentage > 0 && incentive),
  )

type SupplyRateMetricsParams = {
  supplyApy: number | Nullish
  crvBoostApr: Range<number> | Nullish
  rebasingYieldApy: number | Nullish
  extraIncentivesApy: number | Nullish
  campaignsApy: number | Nullish
  userSupplyBoost?: Decimal | Nullish
}

/**
 * Get the supply rate metrics for a given supply APY and lending snapshots, like average rate, total boosted rates.
 */
export const getSupplyApyMetrics = ({
  supplyApy,
  crvBoostApr,
  rebasingYieldApy,
  extraIncentivesApy,
  campaignsApy,
  userSupplyBoost,
}: SupplyRateMetricsParams) => {
  rebasingYieldApy = rebasingYieldApy ?? null
  extraIncentivesApy = extraIncentivesApy ?? 0

  const [crvMinBoostApr, crvMaxBoostApr] = crvBoostApr ?? []

  const crvMinBoostApy = aprToApy(crvMinBoostApr, 'llamalend.rewards') ?? null
  const crvMaxBoostApy = aprToApy(crvMaxBoostApr, 'llamalend.rewards') ?? null
  const userBoostApy =
    maybes([crvMinBoostApr, userSupplyBoost], (apr, boost) =>
      aprToApy(getUserBoostApr(apr, boost), 'llamalend.rewards'),
    ) ?? null

  const totalWithoutBoost = sumRates(supplyApy, rebasingYieldApy, extraIncentivesApy, campaignsApy)

  return {
    supplyApy,
    supplyApyCrvMinBoost: crvMinBoostApy,
    supplyApyCrvMaxBoost: crvMaxBoostApy,
    userBoostApy,
    rebasingYield: rebasingYieldApy,
    extraIncentivesTotalApy: extraIncentivesApy,
    totalMinBoost: sumRates(totalWithoutBoost, crvMinBoostApy),
    totalMaxBoost: sumRates(totalWithoutBoost, crvMaxBoostApy),
    totalUserBoost: maybes([totalWithoutBoost, userBoostApy], (total, boost) => sumRates(total, boost)) ?? null,
  }
}

export const getSupplyApyAverageMetrics = ({
  snapshots,
  daysBack,
}: {
  snapshots: LendingSnapshot[] | undefined
  daysBack: number
}) => {
  const averages = calculateAverageRates(snapshots, daysBack, {
    supplyApy: ({ lendApy }) => Number(lendApy) * 100,
    rebasingYieldApy: ({ borrowedToken }) => borrowedToken.rebasingYield,
    crvMinBoostApr: ({ lendAprCrv0Boost }) => lendAprCrv0Boost * 100,
    crvMinBoostApy: ({ lendAprCrv0Boost }) => aprToApy(lendAprCrv0Boost * 100, 'llamalend.rewards'),
    crvMaxBoostApy: ({ lendAprCrvMaxBoost }) => aprToApy(lendAprCrvMaxBoost * 100, 'llamalend.rewards'),
    extraIncentivesApy: ({ extraRewardApr }) =>
      sumBy(extraRewardApr, reward => aprToApy(reward.rate, 'llamalend.rewards')),
  })

  const averageTotalWithoutBoost = sumRates(
    averages?.supplyApy,
    averages?.rebasingYieldApy,
    averages?.extraIncentivesApy,
  )

  return {
    averageLendApy: averages?.supplyApy ?? null,
    averageApyCrvMinBoost: averages?.crvMinBoostApy ?? null,
    averageApyCrvMaxBoost: averages?.crvMaxBoostApy ?? null,
    averageUserBoostApy: null,
    averageRebasingYield: averages?.rebasingYieldApy ?? null,
    averageExtraIncentivesApy: averages?.extraIncentivesApy ?? null,
    totalAverageMinBoost: sumRates(averageTotalWithoutBoost, averages?.crvMinBoostApy),
    totalAverageMaxBoost: sumRates(averageTotalWithoutBoost, averages?.crvMaxBoostApy),
    totalAverageUserBoost: null,
  }
}

export const convertRates = ({
  borrowApr,
  borrowApy,
  lendApr,
  lendApy,
}: {
  borrowApr: string
  borrowApy: string
  lendApr: string
  lendApy: string
}) => ({
  borrowApr: decimal(borrowApr),
  borrowApy: decimal(borrowApy),
  lendApy: decimal(lendApy),
  lendApr: decimal(lendApr),
})
