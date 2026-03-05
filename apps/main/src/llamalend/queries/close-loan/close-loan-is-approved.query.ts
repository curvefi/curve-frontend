import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'

export const { useQuery: useCloseLoanIsApproved, fetchQuery: fetchCloseIsApproved } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams<IChainId>) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'selfLiquidateIsApproved'] as const,
  queryFn: async ({ marketId }: UserMarketQuery<IChainId>): Promise<boolean> => {
    const market = getLlamaMarket(marketId)
    const loan = 'loan' in market ? market.loan : market
    return await loan.selfLiquidateIsApproved()
  },
  category: 'llamalend.closeLoan',
  validationSuite: userMarketValidationSuite,
})
