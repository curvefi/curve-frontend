import type { MarketParams, MarketQuery } from '@evm-ui/queries/root-keys'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { getLendVault } from './market.query-helpers'

/** Queries the current maximum deposit allowed by the vault. */
export const { useQuery: useMarketVaultMaxDeposit } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({
    ...rootKeys.market({ chainId, marketId }),
    name: 'maxDeposit',
    version: 1,
  }),
  queryFn: async ({ marketId }: MarketQuery) => (await getLendVault(marketId).maxDeposit()) as Decimal,
  category: 'llamalend.supply',
  validationSuite: marketIdValidationSuite,
})
