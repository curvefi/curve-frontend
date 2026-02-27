import { getUserGaugeVotes } from '@curvefi/prices-api/gauge/api'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

export type UserGaugeVoteFormatted = {
  gauge: string
  gaugeName: string
  weight: number
  blockNumber: number
  timestamp: number
  txHash: string
}

const _fetchUserGaugeVotes = async ({ userAddress }: { userAddress: string }): Promise<UserGaugeVoteFormatted[]> => {
  const votes = await getUserGaugeVotes(userAddress)

  return votes.map((vote) => ({
    ...vote,
    timestamp: vote.timestamp.getTime() / 1000,
  }))
}

export const { useQuery: useUserGaugeVoteQuery, invalidate: invalidateUserGaugeVoteQuery } = queryFactory({
  queryKey: (params: { userAddress: string }) => ['user-gauge-votes', { userAddress: params.userAddress }] as const,
  queryFn: _fetchUserGaugeVotes,
  category: 'user',
  validationSuite: EmptyValidationSuite,
})
