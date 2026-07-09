import { getResetImplementation } from '@/llamalend/queries/reset/reset-query.helpers'
import { resetSupportedValidationSuite } from '@/llamalend/queries/validation/reset.validation'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'

export const { useQuery: useResetIsAvailable, queryKey: resetIsAvailableQueryKey } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams<IChainId>) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'resetIsAvailable'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery<IChainId>) =>
    await getResetImplementation(marketId).isRepayWithShrinkAvailable(userAddress),
  category: 'llamalend.repay',
  validationSuite: resetSupportedValidationSuite,
})
