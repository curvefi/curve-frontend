import type { QueryUsdRates } from '@/entities/usd-rates'

import { queryOptions } from '@tanstack/react-query'

import { REFRESH_INTERVAL } from '@/constants'
import { createQueryHook } from '@/shared/lib/queries/factory'
import { keys } from '@/entities/usd-rates/model'
import * as api from '@/entities/usd-rates/api'
import * as conditions from '@/entities/usd-rates/model/query-conditions'

export const useUsdRates = createQueryHook((params: QueryUsdRates) =>
  queryOptions({
    queryKey: keys.usdRates(params),
    queryFn: api.queryUsdRates,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: conditions.enableUsdRates(params),
  })
)
