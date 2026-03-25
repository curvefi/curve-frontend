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

const getLatestSnapshotValue = <TSnapshot extends WithTimestamp, TValue>(
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

type SupplyRateMetricsParams = {
  supplyApy: number | null
  snapshots: LendingSnapshot[] | undefined
  onChainCrvRates?: number[]
  onChainRewardsApr?: { apy: number; symbol: string; tokenAddress: string }[]
  daysBack?: number
}

/**
 * Get the supply rate metrics for a given supply APY and lending snapshots, like average rate, total boosted rates.
 * Parallels `getBorrowRateMetrics` for the supply side.
 */
export const getSupplyRateMetrics = ({
  supplyApy,
  snapshots,
  onChainCrvRates,
  onChainRewardsApr,
  daysBack = LAST_MONTH,
}: SupplyRateMetricsParams) => {
  const averages = calculateAverageRates(snapshots, daysBack, {
    lendApy: ({ lendApy }) => Number(lendApy) * 100,
    rebasingYield: ({ borrowedToken }) => borrowedToken.rebasingYield,
    aprCrvMinBoost: ({ lendAprCrv0Boost }) => lendAprCrv0Boost,
    aprCrvMaxBoost: ({ lendAprCrvMaxBoost }) => lendAprCrvMaxBoost,
    extraIncentivesApr: ({ extraRewardApr }) => extraRewardApr.reduce((acc, r) => acc + r.rate, 0),
  })

  const supplyAprCrvMinBoost = onChainCrvRates?.[0] ?? snapshots?.[0]?.lendAprCrv0Boost ?? 0
  const supplyAprCrvMaxBoost = onChainCrvRates?.[1] ?? snapshots?.[0]?.lendAprCrvMaxBoost ?? 0
  const rebasingYield = snapshots?.at(-1)?.borrowedToken?.rebasingYield ?? null
  const extraIncentivesTotalApr = onChainRewardsApr?.reduce((acc, r) => acc + r.apy, 0) ?? 0

  return {
    supplyApy,
    averageLendApy: averages?.lendApy ?? null,
    supplyAprCrvMinBoost,
    supplyAprCrvMaxBoost,
    averageAprCrvMinBoost: averages?.aprCrvMinBoost ?? null,
    averageAprCrvMaxBoost: averages?.aprCrvMaxBoost ?? null,
    rebasingYield,
    averageRebasingYield: averages?.rebasingYield ?? null,
    extraIncentivesTotalApr,
    averageExtraIncentivesApr: averages?.extraIncentivesApr ?? null,
    totalMinBoost: sumRates(supplyApy, rebasingYield, extraIncentivesTotalApr, supplyAprCrvMinBoost),
    totalMaxBoost: sumRates(supplyApy, rebasingYield, extraIncentivesTotalApr, supplyAprCrvMaxBoost),
    totalAverageMinBoost: sumRates(
      averages?.lendApy,
      averages?.rebasingYield,
      averages?.extraIncentivesApr,
      averages?.aprCrvMinBoost,
    ),
    totalAverageMaxBoost: sumRates(
      averages?.lendApy,
      averages?.rebasingYield,
      averages?.extraIncentivesApr,
      averages?.aprCrvMaxBoost,
    ),
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
