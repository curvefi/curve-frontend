import { getYield } from '@curvefi/prices-api/savings'
import type { Yield } from '@curvefi/prices-api/savings/models'
import { toDate } from '@curvefi/prices-api/timestamp'
import { queryFactory } from '@ui-kit/lib/model/query'
import { timeOptionValidationSuite, type TimeOption } from '@ui-kit/lib/model/query/time-option-validation'
import { TIME_OPTION_MS } from '@ui-kit/lib/model/time'
import { addMovingAverages } from '@ui-kit/shared/ui/Chart'

export type ScrvUsdYieldWithAverages = Yield & { proj_apy_7d_avg: number; proj_apy_total_avg: number }

const _getScrvUsdYield = async (params: { timeOption: TimeOption }) => {
  const aggNumbers: Record<TimeOption, number> = { '1M': 4, '6M': 16, '1Y': 32 }
  const timeUnit: Record<TimeOption, string> = { '1M': 'hour', '6M': 'hour', '1Y': 'hour' }

  const startTimestamp = Math.floor((Date.now() - TIME_OPTION_MS[params.timeOption]) / 1000)
  const endTimestamp = Math.floor(Date.now() / 1000)

  const data = await getYield(aggNumbers[params.timeOption], timeUnit[params.timeOption], startTimestamp, endTimestamp)

  if (!data) {
    return []
  }

  const enriched = addMovingAverages(
    data,
    item => item.apyProjected,
    item => toDate(item.timestamp).getTime(),
  )

  return enriched.map(({ movingAverage, totalAverage, ...item }) => ({
    ...item,
    proj_apy_7d_avg: movingAverage,
    proj_apy_total_avg: totalAverage,
  })) as ScrvUsdYieldWithAverages[]
}

export const { useQuery: useScrvUsdYield } = queryFactory({
  queryKey: (params: { timeOption: TimeOption }) => ['scrvUsdYield', { timeOption: params.timeOption }] as const,
  queryFn: _getScrvUsdYield,
  validationSuite: timeOptionValidationSuite,
  category: 'savings.stats',
})
