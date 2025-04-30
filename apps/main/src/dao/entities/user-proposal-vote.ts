import { getUserProposalVote } from '@curvefi/prices-api/proposal/api'
import { ProposalType } from '@curvefi/prices-api/proposal/models'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

const _fetchUserProposalVote = async ({
  userAddress,
  proposalId,
  proposalType,
  txHash,
}: {
  userAddress: string
  proposalId: number
  proposalType: ProposalType
  txHash?: string // used to pass a tx hash to the api to force-update it after casting a vote
}) => getUserProposalVote(userAddress, proposalId, proposalType, txHash)

export const { useQuery: useUserProposalVoteQuery, invalidate: invalidateUserProposalVoteQuery } = queryFactory({
  queryKey: (params: { userAddress: string; proposalId: number; proposalType: ProposalType; txHash?: string }) =>
    [
      'user-proposal-vote',
      { userAddress: params.userAddress },
      { proposalId: params.proposalId },
      { proposalType: params.proposalType },
      { txHash: params.txHash },
    ] as const,
  queryFn: _fetchUserProposalVote,
  validationSuite: EmptyValidationSuite,
})
