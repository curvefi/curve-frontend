import { getResetImplementation } from '@/llamalend/queries/reset/reset-query.helpers'
import { resetSupportedValidationSuite } from '@/llamalend/queries/validation/reset.validation'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketParams, UserMarketQuery } from '@evm-ui/queries/query-types'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useResetIsAvailable, queryKey: resetIsAvailableQueryKey } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams<IChainId>) => ({
    name: 'resetIsAvailable',
    chainId,
    marketId,
    userAddress,
  }),
  queryFn: async ({ marketId, userAddress }: UserMarketQuery<IChainId>) =>
    await getResetImplementation(marketId).isRepayWithShrinkAvailable(userAddress),
  category: 'llamalend.repay',
  validationSuite: resetSupportedValidationSuite,
})
