import { getPricesImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { MarketParams, type MarketQuery, rootKeys } from '@evm-ui/queries/root-keys'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useMarketOraclePriceBand, queryKey: getMarketOraclePriceBandKey } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({
    ...rootKeys.market({ chainId, marketId }),
    name: 'oraclePriceBand',
  }),
  queryFn: ({ marketId }: MarketQuery): Promise<number> => getPricesImplementation(marketId).oraclePriceBand(),
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
