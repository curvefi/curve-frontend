import { computeTotalRate } from '@/llamalend/llama.utils'
import type { CrvUsdSnapshot } from '@ui-kit/entities/crvusd-snapshots'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import { Duration } from '@ui-kit/themes/design/0_primitives'
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

export const getCrvUsdSnapshotBorrowRate = ({ borrowApr }: CrvUsdSnapshot) => borrowApr
export const getLendingSnapshotBorrowRate = ({ borrowApr }: LendingSnapshot) => borrowApr * 100
export const getSnapshotCollateralRebasingYieldRate = <
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
