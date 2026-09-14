import { getUserGaugeVotes } from '@curvefi/prices-api/gauge'
import { queryFactory } from '@ui/features/queries/factory'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'

export const { useQuery: useUserGaugeVoteQuery, invalidate: invalidateUserGaugeVoteQuery } = queryFactory({
  queryKey: (params: { userAddress: string }) => ['user-gauge-votes', { userAddress: params.userAddress }] as const,
  queryFn: async ({ userAddress }: { userAddress: string }) => await getUserGaugeVotes(userAddress),
  category: 'dao.user',
  validationSuite: EmptyValidationSuite,
})
