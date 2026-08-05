import { getUsdPriceHistoryRange } from '@curvefi/prices-api/usd-price'
import { EmptyValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { fetchChunkedTimeSeries, getTimeRange } from './time-series-history'

// The endpoint returns at most 300 rows. A 299-day inclusive range contains at most 300 daily buckets.
const MAX_HISTORY_RANGE_DAYS = 299

type CrvUsdPriceQuery = { days: number }
type CrvUsdPriceParams = FieldsOf<CrvUsdPriceQuery>

export const { useQuery: useCrvUsdPriceHistory } = queryFactory({
  category: 'analytics.chart',
  queryKey: ({ days }: CrvUsdPriceParams) => ['crvusd-price', 'v2', { days }] as const,
  queryFn: ({ days }: CrvUsdPriceQuery) =>
    fetchChunkedTimeSeries({
      range: getTimeRange(days),
      maxDays: MAX_HISTORY_RANGE_DAYS,
      order: 'asc',
      fetchChunk: range => getUsdPriceHistoryRange('ethereum', CRVUSD_ADDRESS, range),
    }),
  validationSuite: EmptyValidationSuite,
  keepPreviousData: true,
})
