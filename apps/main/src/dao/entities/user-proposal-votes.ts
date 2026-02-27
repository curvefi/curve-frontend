import { paginate } from '@curvefi/prices-api/paginate'
import { getUserProposalVotes } from '@curvefi/prices-api/proposal/api'
import { ProposalType, UserProposalVote } from '@curvefi/prices-api/proposal/models'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { TIME_FRAMES } from '@ui-kit/lib/model'
import { queryFactory } from '@ui-kit/lib/model/query'

const { WEEK } = TIME_FRAMES

export type UserProposalVoteFormatted = {
  voteId: number
  voteType: ProposalType
  voteFor: number
  voteAgainst: number
  voteOpen: number
  voteClose: number
  voteTotalSupply: number
}

type UserProposalVotesMapper = {
  [proposalKey: string]: UserProposalVoteFormatted
}

const _fetchUserProposalVotes = async ({ userAddress }: { userAddress: string }) => {
  const results: UserProposalVote[] = await paginate(
    (page, offset) => getUserProposalVotes(userAddress, page, offset),
    1,
    1000,
  )

  const userProposalVotesMapper = results.reduce((mapper: UserProposalVotesMapper, vote: UserProposalVote) => {
    mapper[`${vote.proposal.id}-${vote.proposal.type.toLowerCase()}`] = {
      voteId: vote.proposal.id,
      voteType: vote.proposal.type,
      voteFor: Number(vote.votes.find((v) => v.supports)?.weight ?? 0) / 1e18,
      voteAgainst: Number(vote.votes.find((v) => !v.supports)?.weight ?? 0) / 1e18,
      voteOpen: vote.proposal.start,
      voteClose: vote.proposal.start + WEEK,
      voteTotalSupply: vote.proposal.totalSupply,
    }

    return mapper
  }, {} as UserProposalVotesMapper)
  return userProposalVotesMapper
}

export const { useQuery: useUserProposalVotesQuery, invalidate: invalidateUserProposalVotesQuery } = queryFactory({
  queryKey: (params: { userAddress: string }) => ['user-proposal-votes', { userAddress: params.userAddress }] as const,
  queryFn: _fetchUserProposalVotes,
  category: 'dao.user',
  validationSuite: EmptyValidationSuite,
})
