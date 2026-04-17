import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui-kit/lib/model/query'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import type { MarketParams, MarketQuery } from '@ui-kit/lib/model/query/root-keys'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import { getLendVault } from './market.query-helpers'

/** Queries the current maximum deposit allowed by the vault. */
export const { useQuery: useMarketVaultMaxDeposit } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'maxDeposit', 'v1'] as const,
  queryFn: async ({ marketId }: MarketQuery) => (await getLendVault(marketId).maxDeposit()) as Decimal,
  category: 'llamalend.supply',
  validationSuite: marketIdValidationSuite,
})
