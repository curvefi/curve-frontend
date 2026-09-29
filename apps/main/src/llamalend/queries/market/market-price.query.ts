import { getPricesImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { type MarketParams, type MarketQuery, rootKeys } from '@evm-ui/queries/root-keys'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useMarketPrice } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ ...rootKeys.market({ chainId, marketId }), name: 'price' }),
  queryFn: async ({ marketId }: MarketQuery) => (await getPricesImplementation(marketId).price()) as Decimal,
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})
