import type { QueryUsdRates } from '@/entities/usd-rates'

import { queryOptions } from '@tanstack/react-query'

import { REFRESH_INTERVAL } from '@/constants'
import { usdRatesKeys } from '@/entities/usd-rates/model'
import * as api from '@/entities/usd-rates/api'
import * as conditions from '@/entities/usd-rates/model/usd-rates-query-conditions'

export const getUsdRates = (params: QueryUsdRates) =>
  queryOptions({
    queryKey: usdRatesKeys.usdRates(params),
    queryFn: api.queryUsdRates,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: conditions.enableUsdRates(params),
  })
