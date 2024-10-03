import { createQueryHook } from '@/shared/lib/queries'
import { getTotalCrvUsdQueryOptions } from '@/entities/chain/model/query-options'

export const useCrvUsdTotalSupply = createQueryHook(getTotalCrvUsdQueryOptions);
