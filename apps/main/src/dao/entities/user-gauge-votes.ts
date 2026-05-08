import { getUserGaugeVotes } from '@curvefi/prices-api/gauge/api'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

export const { useQuery: useUserGaugeVoteQuery, invalidate: invalidateUserGaugeVoteQuery } = queryFactory({
  queryKey: (params: { userAddress: string }) => ['user-gauge-votes', { userAddress: params.userAddress }] as const,
  queryFn: async ({ userAddress }: { userAddress: string }) => await getUserGaugeVotes(userAddress),
  category: 'dao.user',
  validationSuite: EmptyValidationSuite,
})
