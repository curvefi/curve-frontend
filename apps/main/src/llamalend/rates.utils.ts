import { BigNumber } from 'bignumber.js'
import { Decimal } from '@primitives/decimal.utils'
import type { CrvUsdSnapshot } from '@ui-kit/entities/crvusd-snapshots'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { decimal } from '@ui-kit/utils'
import { calculateAverageRates, type WithTimestamp } from '@ui-kit/utils/averageRates'

type BorrowRateMetricsParams<TSnapshot extends WithTimestamp = WithTimestamp> = {
  borrowRate: number | null | undefined
  snapshots: TSnapshot[] | undefined
  getBorrowRate: (snapshot: TSnapshot) => number | null | undefined
  getRebasingYield: (snapshot: TSnapshot) => number | null | undefined
  daysBack?: number
}

const { AverageRates } = Duration

export const LAST_MONTH = AverageRates.Monthly
export const LAST_WEEK = AverageRates.Weekly

export const computeDecimalTotalRate = (rate?: Decimal, rebasingYield?: number | null) =>
  rate && decimal(new BigNumber(rate).minus(rebasingYield ?? 0))

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
  daysBack = LAST_MONTH,
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
export const sumRates = (base: number | null | undefined, ...components: (number | null | undefined)[]) =>
  base == null ? null : components.reduce<number>((sum, c) => sum + (c ?? 0), base)

export const toNumberOrNull = (value: number | string | null | undefined) => (value == null ? null : Number(value))

type OnChainSupplyRewardApr = { apy: number; symbol: string; tokenAddress: string }

const sumSnapshotExtraIncentivesApr = (extraRewardApr: LendingSnapshot['extraRewardApr'] | undefined) =>
  extraRewardApr?.reduce((acc, reward) => acc + reward.rate, 0) ?? 0

export const sumOnChainExtraIncentivesApr = (rewardsApr: OnChainSupplyRewardApr[] | undefined) =>
  rewardsApr?.reduce((acc, reward) => acc + reward.apy, 0) ?? 0

type SupplyRateMetricsParams = {
  supplyApy: number | null | undefined
  crvMinBoostApr: number | null | undefined
  crvMaxBoostApr: number | null | undefined
  rebasingYieldApy: number | null | undefined
  extraIncentivesApr: number | null | undefined
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
  extraIncentivesApr,
  userSupplyBoost,
}: SupplyRateMetricsParams) => {
  crvMinBoostApr = crvMinBoostApr ?? 0
  crvMaxBoostApr = crvMaxBoostApr ?? 0
  rebasingYieldApy = rebasingYieldApy ?? null
  extraIncentivesApr = extraIncentivesApr ?? 0

  const userBoostApr = crvMinBoostApr * (userSupplyBoost ?? 1)
  const totalWithoutBoost = sumRates(supplyApy, rebasingYieldApy, extraIncentivesApr)

  return {
    supplyApy,
    supplyAprCrvMinBoost: crvMinBoostApr,
    supplyAprCrvMaxBoost: crvMaxBoostApr,
    userBoostApr,
    rebasingYield: rebasingYieldApy,
    extraIncentivesTotalApr: extraIncentivesApr,
    totalMinBoost: sumRates(totalWithoutBoost, crvMinBoostApr),
    totalMaxBoost: sumRates(totalWithoutBoost, crvMaxBoostApr),
    totalUserBoost: sumRates(totalWithoutBoost, userBoostApr),
  }
}

export const getSupplyApyAverageMetrics = ({
  snapshots,
  daysBack = LAST_MONTH,
}: {
  snapshots: LendingSnapshot[] | undefined
  daysBack?: number
}) => {
  const averages = calculateAverageRates(snapshots, daysBack, {
    supplyApy: ({ lendApy }) => Number(lendApy) * 100,
    rebasingYieldApy: ({ borrowedToken }) => borrowedToken.rebasingYield,
    crvMinBoostApr: ({ lendAprCrv0Boost }) => lendAprCrv0Boost,
    crvMaxBoostApr: ({ lendAprCrvMaxBoost }) => lendAprCrvMaxBoost,
    extraIncentivesApr: ({ extraRewardApr }) => sumSnapshotExtraIncentivesApr(extraRewardApr),
  })

  const averageTotalWithoutBoost = sumRates(
    averages?.supplyApy,
    averages?.rebasingYieldApy,
    averages?.extraIncentivesApr,
  )

  return {
    averageLendApy: averages?.supplyApy ?? null,
    averageAprCrvMinBoost: averages?.crvMinBoostApr ?? null,
    averageAprCrvMaxBoost: averages?.crvMaxBoostApr ?? null,
    averageRebasingYield: averages?.rebasingYieldApy ?? null,
    averageExtraIncentivesApr: averages?.extraIncentivesApr ?? null,
    totalAverageMinBoost: sumRates(averageTotalWithoutBoost, averages?.crvMinBoostApr),
    totalAverageMaxBoost: sumRates(averageTotalWithoutBoost, averages?.crvMaxBoostApr),
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
