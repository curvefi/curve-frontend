import { getUserGaugeVotes } from '@curvefi/prices-api/gauge'
import { EmptyValidationSuite } from '@evm-ui/lib'
import { queryFactory } from '@evm-ui/lib/model/query'

export const { useQuery: useUserGaugeVoteQuery, invalidate: invalidateUserGaugeVoteQuery } = queryFactory({
  queryKey: (params: { userAddress: string }) => ['user-gauge-votes', { userAddress: params.userAddress }] as const,
  queryFn: async ({ userAddress }: { userAddress: string }) => await getUserGaugeVotes(userAddress),
  category: 'dao.user',
  validationSuite: EmptyValidationSuite,
})
