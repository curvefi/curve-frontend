import { sumBy } from 'lodash'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { CampaignRewards } from '@evm-ui/queries/campaigns'
import type { CrvUsdSnapshot } from '@evm-ui/queries/crvusd-snapshots.query'
import type { LendingSnapshot } from '@evm-ui/queries/lending-snapshots.query'
import { type ExtraIncentive, MarketRateType, MarketType } from '@evm-ui/types/market'
import { MAINNET_CRV_ADDRESS } from '@evm-ui/utils'
import { calculateAverageRates, type WithTimestamp } from '@evm-ui/utils/averageRates'
import { toArray } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { type Nullish, maybe, maybes, notFalsy, recordValues } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { DISABLED_Q, mapQuery, type QueryProp, type Range } from '@ui/features/queries/util'
import { decimal } from '@ui/lib/decimal'
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

type BorrowRateMetricsParams<TSnapshot extends WithTimestamp = WithTimestamp> = {
  borrowRate: number | Nullish
  campaignsRate: number | Nullish
  snapshots: TSnapshot[] | undefined
  getBorrowRate: (snapshot: TSnapshot) => number | Nullish
  getRebasingYield: (snapshot: TSnapshot) => number | Nullish
  daysBack: number
}

export const computeTotalRate = (rate: number, rebasingYield: number, campaignsRate: number) =>
  rate - rebasingYield - campaignsRate

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

/** Return on equity at the market's maximum leverage. */
export const getMaxReturnOnEquity = ({
  leverage,
  assets: {
    collateral: { rebasingYield },
  },
  rates: { borrowApy },
}: Pick<LlamaMarket, 'leverage' | 'assets' | 'rates'>): number | undefined =>
  getReturnOnEquity(leverage, rebasingYield, borrowApy)

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
export const getSnapshotCollateralRebasingYieldApr = <
  TSnapshot extends { collateralToken: { rebasingYieldApr: number | Nullish } },
>(
  snapshot: TSnapshot,
) => snapshot.collateralToken.rebasingYieldApr

export const getLatestSnapshotValue = <TSnapshot extends WithTimestamp, TValue>(
  snapshots: TSnapshot[] | undefined,
  getValue: (snapshot: TSnapshot) => TValue | Nullish,
) => {
  const latest = snapshots?.at(-1)
  return latest ? (getValue(latest) ?? null) : null
}
/**
 * Get the borrow rate metrics for a given borrow rate and snapshots, like average rate, total net rate.
 */
export const getBorrowRateMetrics = <TSnapshot extends WithTimestamp = WithTimestamp>({
  borrowRate,
  campaignsRate,
  snapshots,
  getBorrowRate,
  getRebasingYield,
  daysBack,
}: BorrowRateMetricsParams<TSnapshot>) => {
  const rebasingYield = getLatestSnapshotValue(snapshots, getRebasingYield)
  const totalRate =
    maybe(borrowRate, borrowRate => computeTotalRate(borrowRate, rebasingYield ?? 0, campaignsRate ?? 0)) ?? null

  const averages = calculateAverageRates(snapshots, daysBack, { rate: getBorrowRate, rebasingYield: getRebasingYield })
  const averageRate = averages?.rate ?? null
  const averageRebasingYield = averages?.rebasingYield ?? null

  return {
    rebasingYield,
    totalRate,
    averageRate,
    averageRebasingYield,
    averageTotalRate:
      maybe(averageRate, averageRate => computeTotalRate(averageRate, averageRebasingYield ?? 0, 0)) ?? null,
  }
}

/** Sum a base rate with optional additional components, returning null if the base is null */
const sumRates = (base: number | Nullish, ...components: (number | Nullish)[]) =>
  maybe(base, base => components.reduce<number>((sum, c) => sum + (c ?? 0), base)) ?? null

export const toNumberOrNull = (value: number | string | Nullish) => maybe(value, value => Number(value)) ?? null

type OnChainSupplyRewardApr = { apy: number; symbol: string; tokenAddress: string }

export const sumOnChainExtraIncentivesApy = (rewardsApr: OnChainSupplyRewardApr[] | undefined) =>
  rewardsApr && rewardsApr.length > 0 ? sumBy(rewardsApr, reward => aprToApy(reward.apy, 'llamalend.rewards')) : null

export const sumCampaignsApr = (campaigns: CampaignRewards[] | undefined) =>
  campaigns && campaigns.length > 0
    ? sumBy(
        campaigns.filter(c => c.reward?.type === 'apr'),
        c => c.reward?.value ?? 0,
      )
    : null

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
 * Parallels `getBorrowRateMetrics` for the supply side.
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
    maybes([crvMinBoostApr, userSupplyBoost], (apr, boost) => aprToApy(apr * +boost, 'llamalend.rewards')) ?? null

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
