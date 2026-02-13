import { computeTotalRate } from '@/llamalend/llama.utils'
import type { CrvUsdSnapshot } from '@ui-kit/entities/crvusd-snapshots'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { calculateAverageRates } from '@ui-kit/utils/averageRates'

type RateSnapshot = CrvUsdSnapshot | LendingSnapshot

type SnapshotAveragesConfig<TSnapshot extends RateSnapshot = RateSnapshot> = {
  snapshots: TSnapshot[] | undefined
  daysBack: number
  getRate: (snapshot: TSnapshot) => number | null | undefined
  getRebasingYield: (snapshot: TSnapshot) => number | null | undefined
}

type UseRateMetricsParams<TSnapshot extends RateSnapshot = RateSnapshot> = {
  rate: number | null | undefined
  rebasingYield: number | null | undefined
  average?: SnapshotAveragesConfig<TSnapshot>
}

const { AverageRates } = Duration

export const DAYS_BACK = AverageRates.Monthly // number of days to fetch snapshots for average calcs

export const useRateMetrics = <TSnapshot extends RateSnapshot = RateSnapshot>({
  rate,
  rebasingYield,
  average,
}: UseRateMetricsParams<TSnapshot>) => {
  const totalRate = rate == null ? null : computeTotalRate(rate, rebasingYield ?? 0)

  if (!average) {
    return {
      totalRate,
      averageRate: null,
      averageRebasingYield: null,
      averageTotalRate: null,
    }
  }

  const averages = calculateAverageRates(average.snapshots, average.daysBack, {
    rate: average.getRate,
    rebasingYield: average.getRebasingYield,
  })
  const averageRate = averages?.rate ?? null
  const averageRebasingYield = averages?.rebasingYield ?? null

  return {
    totalRate,
    averageRate,
    averageRebasingYield,
    averageTotalRate: averageRate == null ? null : computeTotalRate(averageRate, averageRebasingYield ?? 0),
  }
}
