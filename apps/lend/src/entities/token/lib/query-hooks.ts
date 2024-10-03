import { createQueryHook } from '@/shared/lib/queries'
import { getTokenUsdRateQueryOptions } from '@/entities/token/model/query-options'

export const useTokenUsdRate = createQueryHook(getTokenUsdRateQueryOptions);
