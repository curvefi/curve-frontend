import { TOP_HOLDERS } from '@/dao/constants'
import { getProposal } from '@curvefi/prices-api/proposal/api'
import { ProposalType } from '@curvefi/prices-api/proposal/models'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

const _fetchProposalPricesApi = async ({
  proposalId,
  proposalType,
  txHash,
}: {
  proposalId: number
  proposalType: ProposalType
  // txHash is passed to force the API to update after fe. casting a vote or a proposal execution
  txHash?: string
}) => {
  const proposal = await getProposal(proposalId, proposalType, txHash)

  const parsedProposal = {
    ...proposal,
    votes: proposal.votes
      .map((vote) => ({
        ...vote,
        topHolder: TOP_HOLDERS[vote.voter.toLowerCase()]?.title ?? null,
        stake: +vote.votingPower,
        relativePower: (+vote.votingPower / +proposal.totalSupply) * 100,
      }))
      .sort((a, b) => b.stake - a.stake),
  }

  return parsedProposal
}

export const { useQuery: useProposalPricesApiQuery, invalidate: invalidateProposalPricesApi } = queryFactory({
  queryKey: (params: { proposalId: number; proposalType: ProposalType; txHash?: string }) =>
    [
      'proposal-prices-api',
      { proposalId: params.proposalId },
      { proposalType: params.proposalType },
      { txHash: params.txHash },
    ] as const,
  queryFn: _fetchProposalPricesApi,
  category: 'table',
  validationSuite: EmptyValidationSuite,
})
