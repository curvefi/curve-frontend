import type { MarketParams, MarketQuery } from '@evm-ui/queries/query-types'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { getLendVault } from './market.query-helpers'

/** Queries the current maximum deposit allowed by the vault. */
export const { useQuery: useMarketVaultMaxDeposit } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'maxDeposit', version: 1, chainId, marketId }) as const,
  queryFn: async ({ marketId }: MarketQuery) => (await getLendVault(marketId).maxDeposit()) as Decimal,
  category: 'llamalend.supply',
  validationSuite: marketIdValidationSuite,
})
