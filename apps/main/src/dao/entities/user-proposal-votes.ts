import { paginate } from '@curvefi/prices-api/paginate'
import { getUserProposalVotes, type ProposalType, type UserProposalVote } from '@curvefi/prices-api/proposal'
import { DEFAULT_PAGE_START_INDEX } from '@evm-ui/features/activity-table/utils'
import type { UserParams, UserQuery } from '@evm-ui/queries/query-types'
import { userAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { TIME_FRAMES } from '@ui/lib/time'
import { createValidationSuite } from '@ui/lib/validation/lib'

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

type UserProposalVotesMapper = Record<string, UserProposalVoteFormatted>

const _fetchUserProposalVotes = async ({ userAddress }: UserQuery) => {
  const results: UserProposalVote[] = await paginate(
    (page, offset) => getUserProposalVotes(userAddress, page, offset),
    { page: DEFAULT_PAGE_START_INDEX },
  )

  const userProposalVotesMapper = results.reduce((mapper: UserProposalVotesMapper, vote: UserProposalVote) => {
    mapper[`${vote.proposal.id}-${vote.proposal.type.toLowerCase()}`] = {
      voteId: vote.proposal.id,
      voteType: vote.proposal.type,
      voteFor: Number(vote.votes.find(v => v.supports)?.weight ?? 0) / 1e18,
      voteAgainst: Number(vote.votes.find(v => !v.supports)?.weight ?? 0) / 1e18,
      voteOpen: vote.proposal.start,
      voteClose: vote.proposal.start + WEEK,
      voteTotalSupply: vote.proposal.totalSupply,
    }

    return mapper
  }, {} as UserProposalVotesMapper)
  return userProposalVotesMapper
}

export const { useQuery: useUserProposalVotesQuery, invalidate: invalidateUserProposalVotesQuery } = queryFactory({
  queryKey: ({ userAddress }: UserParams) => ({ name: 'user-proposal-votes', userAddress }) as const,
  queryFn: _fetchUserProposalVotes,
  category: 'dao.user',
  validationSuite: createValidationSuite((params: UserParams) => userAddressValidationGroup(params)),
})
