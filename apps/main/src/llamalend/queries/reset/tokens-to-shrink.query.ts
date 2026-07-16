import { resetIsAvailableQueryKey } from '@/llamalend/queries/reset/reset-is-available.query'
import { getResetImplementation } from '@/llamalend/queries/reset/reset-query.helpers'
import { resetSupportedValidationSuite } from '@/llamalend/queries/validation/reset.validation'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'

/** Returns the amount of (borrow) tokens required at minimum in the user's wallet in order to repay with shrink. */
export const { useQuery: useTokensToShrink } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams<IChainId>) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'tokensToShrink'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery<IChainId>) =>
    // First parameter of tokensToShrink called dCollateral is for leverage, but we don't support that yet so we set it to zero for now.
    (await getResetImplementation(marketId).tokensToShrink('0', userAddress)) as Decimal,
  category: 'llamalend.repay',
  validationSuite: resetSupportedValidationSuite,
  dependencies: params => [resetIsAvailableQueryKey(params)],
})
