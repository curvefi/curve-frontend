import { getYield } from '@curvefi/prices-api/savings'
import type { Yield } from '@curvefi/prices-api/savings/models'
import { queryFactory } from '@ui-kit/lib/model/query'
import { timeOptionValidationSuite, type TimeOption } from '@ui-kit/lib/model/query/time-option-validation'
import { TIME_FRAMES } from '@ui-kit/lib/model/time'

export type ScrvUsdYieldWithAverages = Yield & { proj_apy_7d_avg: number; proj_apy_total_avg: number }

export const _getScrvUsdYield = async (params: { timeOption: TimeOption }) => {
  // calcs starting timestamp
  const timeOptionCalc: Record<TimeOption, number> = {
    '1M': 30 * TIME_FRAMES.DAY_MS, // 30 days
    '6M': 180 * TIME_FRAMES.DAY_MS, // 180 days
    '1Y': 365 * TIME_FRAMES.DAY_MS, // 365 days
  }
  // sets number of aggregations
  const aggNumbers: Record<TimeOption, number> = { '1M': 4, '6M': 16, '1Y': 32 }
  const timeUnit: Record<TimeOption, string> = { '1M': 'hour', '6M': 'hour', '1Y': 'hour' }

  const startTimestamp = Math.floor((Date.now() - timeOptionCalc[params.timeOption]) / 1000)
  const endTimestamp = Math.floor(Date.now() / 1000)

  const data = await getYield(aggNumbers[params.timeOption], timeUnit[params.timeOption], startTimestamp, endTimestamp)

  if (!data) {
    return []
  }

  const dataWithAverages: ScrvUsdYieldWithAverages[] = data?.map((item, index, array) => {
    // Calculate overall average across all data points
    const totalAverage = array.reduce((sum, curr) => sum + curr.apyProjected, 0) / array.length

    // Calculate 7-day moving average
    const SEVEN_DAYS_IN_MILLISECONDS = 7 * TIME_FRAMES.DAY_MS
    const currentTimestamp = item.timestamp.getTime()
    const sevenDaysAgoTimestamp = currentTimestamp - SEVEN_DAYS_IN_MILLISECONDS

    const relevantData = array.filter(
      (dataPoint) =>
        dataPoint.timestamp.getTime() >= sevenDaysAgoTimestamp &&
        dataPoint.timestamp.getTime() <= currentTimestamp &&
        array.indexOf(dataPoint) <= index, // Only include data points up to current index
    )
    const movingAverage = relevantData.reduce((sum, curr) => sum + curr.apyProjected, 0) / relevantData.length

    return { ...item, proj_apy_7d_avg: movingAverage, proj_apy_total_avg: totalAverage }
  })

  return dataWithAverages
}

export const { useQuery: useScrvUsdYield } = queryFactory({
  queryKey: (params: { timeOption: TimeOption }) => ['scrvUsdYield', { timeOption: params.timeOption }] as const,
  queryFn: _getScrvUsdYield,
  validationSuite: timeOptionValidationSuite,
  category: 'detail',
})
