import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketParams, UserMarketQuery } from '@evm-ui/queries/query-types'
import { userMarketValidationSuite } from '@evm-ui/queries/validation/user-market-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useCloseLoanIsApproved, fetchQuery: fetchCloseIsApproved } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams<IChainId>) =>
    ({ name: 'selfLiquidateIsApproved', chainId, marketId, userAddress }) as const,
  queryFn: async ({ marketId }: UserMarketQuery<IChainId>): Promise<boolean> =>
    await getLoanImplementation(marketId).selfLiquidateIsApproved(),
  category: 'llamalend.closeLoan',
  validationSuite: userMarketValidationSuite,
})
