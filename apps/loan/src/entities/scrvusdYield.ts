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

  return data
}

export const { useQuery: useScrvUsdYield } = queryFactory({
  queryKey: (params: { timeFrame: TimeFrame }) => ['scrvUsdYield', { timeFrame: params.timeFrame }] as const,
  queryFn: _getScrvUsdYield,
  staleTime: '5m',
  validationSuite: createValidationSuite(() => {}),
})
