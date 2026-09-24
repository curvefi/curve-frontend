import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { userMarketValidationSuite } from '@evm-ui/lib/model/query/user-market-validation'
import { rootKeys, type UserMarketParams, type UserMarketQuery } from '@evm-ui/queries/root-keys'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useCloseLoanIsApproved, fetchQuery: fetchCloseIsApproved } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams<IChainId>) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'selfLiquidateIsApproved'] as const,
  queryFn: async ({ marketId }: UserMarketQuery<IChainId>): Promise<boolean> =>
    await getLoanImplementation(marketId).selfLiquidateIsApproved(),
  category: 'llamalend.closeLoan',
  validationSuite: userMarketValidationSuite,
})
