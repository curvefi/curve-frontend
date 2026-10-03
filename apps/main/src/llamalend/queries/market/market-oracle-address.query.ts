import { getStatsImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { MarketParams, MarketQuery } from '@evm-ui/queries/query-types'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useMarketOracleAddress } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'oracleAddress', chainId, marketId }),
  queryFn: ({ marketId }: MarketQuery): Promise<string> => getStatsImplementation(marketId).oracleAddress(),
  category: 'llamalend.marketParams',
  validationSuite: marketIdValidationSuite,
})
