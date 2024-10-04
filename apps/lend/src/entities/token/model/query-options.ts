import { queryOptions } from '@tanstack/react-query'
import { tokenKeys, TokenQueryParams } from '@/entities/token'
import { queryTokenUsdRate } from '@/entities/token/api/query'
import { REFRESH_INTERVAL } from '@/constants'
import { checkTokenValidity } from '@/entities/token/lib/validation'

export const getTokenUsdRateQueryOptions = (params: TokenQueryParams) =>
  queryOptions({
    queryKey: tokenKeys.usdRate(params),
    queryFn: queryTokenUsdRate,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: checkTokenValidity(params),
  })
