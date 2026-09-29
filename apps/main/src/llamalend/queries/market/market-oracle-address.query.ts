import { getStatsImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { MarketParams, type MarketQuery, rootKeys } from '@evm-ui/queries/root-keys'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useMarketOracleAddress } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({
    ...rootKeys.market({ chainId, marketId }),
    name: 'oracleAddress',
  }),
  queryFn: ({ marketId }: MarketQuery): Promise<string> => getStatsImplementation(marketId).oracleAddress(),
  category: 'llamalend.marketParams',
  validationSuite: marketIdValidationSuite,
})
