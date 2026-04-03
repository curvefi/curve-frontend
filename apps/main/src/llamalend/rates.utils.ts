import { sumBy } from 'lodash'
import type { CrvUsdSnapshot } from '@ui-kit/entities/crvusd-snapshots'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import { AVERAGE_CATEGORIES, decimal } from '@ui-kit/utils'
import { calculateAverageRates, type WithTimestamp } from '@ui-kit/utils/averageRates'

type BorrowRateMetricsParams<TSnapshot extends WithTimestamp = WithTimestamp> = {
  borrowRate: number | null | undefined
  snapshots: TSnapshot[] | undefined
  getBorrowRate: (snapshot: TSnapshot) => number | null | undefined
  getRebasingYield: (snapshot: TSnapshot) => number | null | undefined
  daysBack: number
}

const DAYS_PER_YEAR = 365

/**
 * Converts an APR into APY using periodic compounding based on a given number of days per compounding period.
 * The function assumes APR is expressed as a percentage (e.g. 10 for 10%) and returns APY as a percentage.
 */
export const aprToApy = (
  aprPercentage: number | null | undefined,
  compoundingDays = AVERAGE_CATEGORIES['llamalend.compoundRate'].window,
): number | null => {
  if (aprPercentage == null) return null

  const periods = DAYS_PER_YEAR / compoundingDays
  const compoundedRate = 1 + aprPercentage / 100 / periods

  return (Math.pow(compoundedRate, periods) - 1) * 100
}

export const computeTotalRate = (rate: number, rebasingYield: number) => rate - rebasingYield

export const getSnapshotBorrowApr = ({ borrowApr }: LendingSnapshot | CrvUsdSnapshot) => borrowApr
export const getSnapshotCollateralRebasingYieldApr = <
  TSnapshot extends { collateralToken: { rebasingYieldApr: number | null | undefined } },
>(
  snapshot: TSnapshot,
) => snapshot.collateralToken.rebasingYieldApr

export const getLatestSnapshotValue = <TSnapshot extends WithTimestamp, TValue>(
  snapshots: TSnapshot[] | undefined,
  getValue: (snapshot: TSnapshot) => TValue | null | undefined,
) => {
  const latest = snapshots?.at(-1)
  return latest ? (getValue(latest) ?? null) : null
}
/**
 * Get the borrow rate metrics for a given borrow rate and snapshots, like average rate, total net rate.
 */
export const getBorrowRateMetrics = <TSnapshot extends WithTimestamp = WithTimestamp>({
  borrowRate,
  snapshots,
  getBorrowRate,
  getRebasingYield,
  daysBack,
}: BorrowRateMetricsParams<TSnapshot>) => {
  const rebasingYield = getLatestSnapshotValue(snapshots, getRebasingYield)
  const totalRate = borrowRate == null ? null : computeTotalRate(borrowRate, rebasingYield ?? 0)

  const averages = calculateAverageRates(snapshots, daysBack, {
    rate: getBorrowRate,
    rebasingYield: getRebasingYield,
  })
  const averageRate = averages?.rate ?? null
  const averageRebasingYield = averages?.rebasingYield ?? null

  return {
    rebasingYield,
    totalRate,
    averageRate,
    averageRebasingYield,
    averageTotalRate: averageRate == null ? null : computeTotalRate(averageRate, averageRebasingYield ?? 0),
  }
}

/** Sum a base rate with optional additional components, returning null if the base is null */
const sumRates = (base: number | null | undefined, ...components: (number | null | undefined)[]) =>
  base == null ? null : components.reduce<number>((sum, c) => sum + (c ?? 0), base)

export const toNumberOrNull = (value: number | string | null | undefined) => (value == null ? null : Number(value))

type OnChainSupplyRewardApr = { apy: number; symbol: string; tokenAddress: string }

export const sumOnChainExtraIncentivesApy = (rewardsApr: OnChainSupplyRewardApr[] | undefined) =>
  rewardsApr && rewardsApr.length > 0 ? sumBy(rewardsApr, (reward) => aprToApy(reward.apy) as number) : null

type SupplyRateMetricsParams = {
  supplyApy: number | null | undefined
  crvMinBoostApr: number | null | undefined
  crvMaxBoostApr: number | null | undefined
  rebasingYieldApy: number | null | undefined
  extraIncentivesApy: number | null | undefined
  userSupplyBoost?: number | null | undefined
}

/**
 * Get the supply rate metrics for a given supply APY and lending snapshots, like average rate, total boosted rates.
 * Parallels `getBorrowRateMetrics` for the supply side.
 */
export const getSupplyApyMetrics = ({
  supplyApy,
  crvMinBoostApr,
  crvMaxBoostApr,
  rebasingYieldApy,
  extraIncentivesApy,
  userSupplyBoost,
}: SupplyRateMetricsParams) => {
  rebasingYieldApy = rebasingYieldApy ?? null
  extraIncentivesApy = extraIncentivesApy ?? 0

  const crvMinBoostApy = aprToApy(crvMinBoostApr)
  const crvMaxBoostApy = aprToApy(crvMaxBoostApr)
  const userBoostApy = aprToApy((crvMinBoostApr ?? 0) * (userSupplyBoost ?? 1))

  const totalWithoutBoost = sumRates(supplyApy, rebasingYieldApy, extraIncentivesApy)

  return {
    supplyApy,
    supplyApyCrvMinBoost: crvMinBoostApy,
    supplyApyCrvMaxBoost: crvMaxBoostApy,
    userBoostApy,
    rebasingYield: rebasingYieldApy,
    extraIncentivesTotalApy: extraIncentivesApy,
    totalMinBoost: sumRates(totalWithoutBoost, crvMinBoostApy),
    totalMaxBoost: sumRates(totalWithoutBoost, crvMaxBoostApy),
    totalUserBoost: sumRates(totalWithoutBoost, userBoostApy),
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
    crvMinBoostApy: ({ lendAprCrv0Boost }) => aprToApy(lendAprCrv0Boost),
    crvMaxBoostApy: ({ lendAprCrvMaxBoost }) => aprToApy(lendAprCrvMaxBoost),
    extraIncentivesApy: ({ extraRewardApr }) => sumBy(extraRewardApr, (reward) => aprToApy(reward.rate) as number),
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
    averageRebasingYield: averages?.rebasingYieldApy ?? null,
    averageExtraIncentivesApy: averages?.extraIncentivesApy ?? null,
    totalAverageMinBoost: sumRates(averageTotalWithoutBoost, averages?.crvMinBoostApy),
    totalAverageMaxBoost: sumRates(averageTotalWithoutBoost, averages?.crvMaxBoostApy),
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
