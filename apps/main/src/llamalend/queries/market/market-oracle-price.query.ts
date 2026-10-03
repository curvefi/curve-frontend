import { getPricesImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { MarketParams, MarketQuery } from '@evm-ui/queries/query-types'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useMarketOraclePrice, queryKey: getMarketOraclePriceKey } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'oraclePrice', chainId, marketId }),
  queryFn: async ({ marketId }: MarketQuery) => (await getPricesImplementation(marketId).oraclePrice()) as Decimal,
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
