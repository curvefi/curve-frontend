import type { TimeOption } from '@ui-kit/lib/types/scrvusd'
import { queryFactory } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'

type ScrvUsdYieldFromApi = {
  timestamp: number
  assets: number
  supply: number
  proj_apy: number
  price: number
}

export type ScrvUsdYieldWithAverages = ScrvUsdYieldFromApi & {
  proj_apy_7d_avg: number
  proj_apy_total_avg: number
}

type GetScrvUsdYieldResponse = {
  data?: ScrvUsdYieldFromApi[]
  detail?: string
}

export const _getScrvUsdYield = async (params: { timeOption: TimeOption }) => {
  const timeOptionCalc = {
    '1d': 300 * 24 * 60 * 60 * 1000,
    '1w': 300 * 24 * 60 * 60 * 7 * 1000,
    '1m': 300 * 24 * 60 * 60 * 30 * 1000,
  }
  const aggNumbers = {
    '1d': 1,
    '1w': 7,
    '1m': 30,
  }

  const startTimestamp = Math.floor((Date.now() - timeOptionCalc[params.timeOption]) / 1000)
  const endTimestamp = Math.floor(Date.now() / 1000)

  const url = `https://prices.curve.fi/v1/crvusd/savings/yield?agg_number=${aggNumbers[params.timeOption]}&agg_units=day&start=${startTimestamp}&end=${endTimestamp}`
  const response = await fetch(url)
  const { data, detail } = (await response.json()) as GetScrvUsdYieldResponse

  // detail is returned from API when there is an error
  if (detail) {
    throw new Error(`Failed to fetch scrvUSD historical yield data. ${detail}`)
  }

  if (!data) {
    return []
  }

  const dataWithAverages: ScrvUsdYieldWithAverages[] = data?.map((item, index, array) => {
    // Calculate overall average across all data points
    const totalAverage = array.reduce((sum, curr) => sum + curr.proj_apy, 0) / array.length

    // Calculate 7-day moving average
    const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60
    const currentTimestamp = item.timestamp
    const sevenDaysAgoTimestamp = currentTimestamp - SEVEN_DAYS_IN_SECONDS

    const relevantData = array.filter(
      (dataPoint) =>
        dataPoint.timestamp >= sevenDaysAgoTimestamp &&
        dataPoint.timestamp <= currentTimestamp &&
        array.indexOf(dataPoint) <= index, // Only include data points up to current index
    )
    const movingAverage = relevantData.reduce((sum, curr) => sum + curr.proj_apy, 0) / relevantData.length

    return {
      ...item,
      proj_apy_7d_avg: movingAverage,
      proj_apy_total_avg: totalAverage,
    }
  })

  return dataWithAverages
}

export const { useQuery: useScrvUsdYield } = queryFactory({
  queryKey: (params: { timeOption: TimeOption }) => ['scrvUsdYield', { timeOption: params.timeOption }] as const,
  queryFn: _getScrvUsdYield,
  staleTime: '5m',
  validationSuite: createValidationSuite(() => {}),
})
