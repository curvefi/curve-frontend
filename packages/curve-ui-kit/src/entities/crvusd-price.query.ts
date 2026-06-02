import { getUsdPriceHistory } from '@curvefi/prices-api/usd-price'
import { EmptyValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'

type CrvUsdPriceQuery = { days: number }
type CrvUsdPriceParams = FieldsOf<CrvUsdPriceQuery>

export const { useQuery: useCrvUsdPriceHistory } = queryFactory({
  category: 'analytics.chart',
  queryKey: ({ days }: CrvUsdPriceParams) => ['crvusd-price', { days }] as const,
  queryFn: ({ days }: CrvUsdPriceQuery) => getUsdPriceHistory('ethereum', CRVUSD_ADDRESS, days),
  validationSuite: EmptyValidationSuite,
  keepPreviousData: true,
})
