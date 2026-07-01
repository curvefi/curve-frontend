import { getResetImplementation } from '@/llamalend/queries/reset/reset-query.helpers'
import {
  type ResetParams,
  type ResetQuery,
  resetValidationSuite,
} from '@/llamalend/queries/validation/reset.validation'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'

export const { useQuery: useResetIsApproved, fetchQuery: fetchResetIsApproved } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userBorrowed = '0' }: ResetParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'resetIsApproved', { userBorrowed }] as const,
  queryFn: async ({ marketId, ...params }: ResetQuery) =>
    await getResetImplementation(marketId).repayIsApproved(params.userBorrowed),
  category: 'llamalend.repay',
  validationSuite: resetValidationSuite,
})
