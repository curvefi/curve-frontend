import { queryOptions } from '@tanstack/react-query'
import { TokenQueryParams } from '@/entities/token'
import { queryTokenUsdRate } from '@/entities/token/api/token-rates'
import { REFRESH_INTERVAL } from '@/constants'
import { checkTokenValidity } from '@/entities/token/lib/validation'
import { tokenKeys } from '@/entities/token/model'

export const getTokenUsdRateQueryOptions = (params: TokenQueryParams) =>
  queryOptions({
    queryKey: tokenKeys.usdRate(params),
    queryFn: queryTokenUsdRate,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: checkTokenValidity(params),
  })
