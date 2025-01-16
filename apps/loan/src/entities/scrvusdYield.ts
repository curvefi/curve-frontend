import { queryFactory } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'

type TimeFrame = '1d' | '1h' | '1m'

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

export const _getScrvUsdYield = async (params: { timeFrame: TimeFrame }) => {
  const timeFrameCalc = {
    '1d': 300 * 24 * 60 * 60 * 1000,
    '1h': 300 * 60 * 60 * 1000,
    '1m': 300 * 60 * 1000,
  }

  const startTimestamp = Math.floor((Date.now() - timeFrameCalc[params.timeFrame]) / 1000)
  const endTimestamp = Math.floor(Date.now() / 1000)

  const url = `https://prices.curve.fi/v1/crvusd/savings/yield?agg_number=1&agg_units=day&start=${startTimestamp}&end=${endTimestamp}`
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

    // Calculate 7-day moving average (looking back 7 days)
    const lookback = 7 * 24 * 12 // 7 days worth of 5-minute intervals
    const startIdx = Math.max(0, index - lookback)
    const relevantData = array.slice(startIdx, index + 1)
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
  queryKey: (params: { timeFrame: TimeFrame }) => ['scrvUsdYield', { timeFrame: params.timeFrame }] as const,
  queryFn: _getScrvUsdYield,
  staleTime: '5m',
  validationSuite: createValidationSuite(() => {}),
})
