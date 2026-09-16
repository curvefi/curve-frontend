import { getUsdPriceHistoryRange } from '@curvefi/prices-api/usd-price'
import { CRVUSD_ADDRESS } from '@evm-ui/utils'
import { queryFactory } from '@ui/features/queries/factory'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'
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
