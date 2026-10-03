import { getPricesImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { MarketParams, MarketQuery } from '@evm-ui/queries/query-types'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useMarketOraclePriceBand, queryKey: getMarketOraclePriceBandKey } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'oraclePriceBand', chainId, marketId }) as const,
  queryFn: ({ marketId }: MarketQuery): Promise<number> => getPricesImplementation(marketId).oraclePriceBand(),
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
