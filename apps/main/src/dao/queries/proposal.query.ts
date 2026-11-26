import { TOP_HOLDERS } from '@/dao/constants'
import { getProposal, type ProposalType } from '@curvefi/prices-api/proposal'
import { queryFactory } from '@ui/features/queries/factory'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'
import { parseProposalData } from '../utils/proposal'

export const { useQuery: useProposal, invalidate: invalidateProposal } = queryFactory({
  queryKey: ({
    proposalId,
    proposalType,
    txHash,
  }: {
    proposalId: number
    proposalType: ProposalType
    txHash?: string
  }) => ({ name: 'proposal', proposalId, proposalType, txHash }) as const,
  queryFn: async ({
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
    return {
      ...parseProposalData(proposal),
      votes: proposal.votes
        .map(vote => ({
          ...vote,
          topHolder: TOP_HOLDERS[vote.voter.toLowerCase()]?.title ?? null,
          stake: +vote.votingPower,
          relativePower: (+vote.votingPower / +proposal.totalSupply) * 100,
        }))
        .toSorted((a, b) => b.stake - a.stake),
    }
  },
  category: 'dao.proposals',
  validationSuite: EmptyValidationSuite,
})
