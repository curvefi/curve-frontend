import { queryFactory, rootKeys, type MarketParams, type MarketQuery } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import type { Decimal } from '@ui-kit/utils'
import { requireVault } from '../validation/supply.validation'

/**
 * Queries the maximum deposit amount for a market.
 */
export const { useQuery: useDepositMax } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => [...rootKeys.market({ chainId, marketId }), 'depositMax'] as const,
  queryFn: async ({ marketId }: MarketQuery) => (await requireVault(marketId).vault.maxDeposit()) as Decimal,
  validationSuite: marketIdValidationSuite,
})
