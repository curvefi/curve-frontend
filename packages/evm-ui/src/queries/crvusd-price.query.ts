import type { IsoDateString } from '@curvefi/prices-api/timestamp'
import { getUsdPriceHistoryRange } from '@curvefi/prices-api/usd-price'
import { CRVUSD_ADDRESS } from '@evm-ui/utils'
import { queryFactory } from '@ui/features/queries/factory'
import type { QueryData } from '@ui/features/queries/util'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'
import { fetchChunkedTimeSeries, getTimeRange } from './time-series-history.query'

// The endpoint returns at most 300 rows. A 299-day inclusive range contains at most 300 daily buckets.
const MAX_HISTORY_RANGE_DAYS = 299

type CrvUsdPriceQuery = { days: number }
type CrvUsdPriceParams = FieldsOf<CrvUsdPriceQuery>

export const { useQuery: useCrvUsdPriceHistory } = queryFactory({
  category: 'analytics.chart',
  queryKey: ({ days }: CrvUsdPriceParams) => ({ name: 'crvusd-price', version: 3, days }) as const,
  queryFn: async ({ days }: CrvUsdPriceQuery) => ({
    prices: await fetchChunkedTimeSeries({
      range: getTimeRange(days),
      maxDays: MAX_HISTORY_RANGE_DAYS,
      order: 'asc',
      fetchChunk: range => getUsdPriceHistoryRange('ethereum', CRVUSD_ADDRESS, range),
    }),
    fetchedAt: new Date().toISOString() as IsoDateString,
  }),
  validationSuite: EmptyValidationSuite,
  keepPreviousData: true,
})

export type CrvUsdPriceHistory = QueryData<typeof useCrvUsdPriceHistory>
