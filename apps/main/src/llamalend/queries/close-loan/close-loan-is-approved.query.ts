import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@evm-ui/lib/model'
import { userMarketValidationSuite } from '@evm-ui/lib/model/query/user-market-validation'

export const { useQuery: useCloseLoanIsApproved, fetchQuery: fetchCloseIsApproved } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams<IChainId>) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'selfLiquidateIsApproved'] as const,
  queryFn: async ({ marketId }: UserMarketQuery<IChainId>): Promise<boolean> =>
    await getLoanImplementation(marketId).selfLiquidateIsApproved(),
  category: 'llamalend.closeLoan',
  validationSuite: userMarketValidationSuite,
})
