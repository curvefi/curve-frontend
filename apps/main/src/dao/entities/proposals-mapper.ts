import { paginate } from '@curvefi/prices-api/paginate'
import { getProposals } from '@curvefi/prices-api/proposal/api'
import type { Proposal, ProposalType } from '@curvefi/prices-api/proposal/models'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { TIME_FRAMES } from '@ui-kit/lib/model'
import { queryFactory } from '@ui-kit/lib/model/query'

const { WEEK } = TIME_FRAMES

export type ProposalData = Omit<Proposal, 'timestamp'> & {
  status: 'Active' | 'Passed' | 'Denied'
  quorumVeCrv: number
  currentQuorumPercentage: number
  timestamp: number
}

export type ProposalsMapper = {
  [voteId: string]: ProposalData
}

export const createProposalKey = (proposalId: number, proposalType: ProposalType) =>
  `${proposalId}-${proposalType.toLowerCase()}`

const getProposalStatus = (
  timestamp: number,
  quorumVeCrv: number,
  votesFor: number,
  votesAgainst: number,
  minSupport: number,
): 'Active' | 'Passed' | 'Denied' => {
  const totalVotes = votesFor + votesAgainst
  const passedQuorum = votesFor >= quorumVeCrv
  const passedMinimum = votesFor / totalVotes > minSupport

  if (timestamp + WEEK > Date.now() / 1000) return 'Active'
  if (passedQuorum && passedMinimum) return 'Passed'
  return 'Denied'
}

const parseProposalData = (proposal: Proposal) => {
  const quorumVeCrv = proposal.quorum * proposal.totalSupply
  const currentQuorumPercentage = (proposal.votesFor / proposal.totalSupply) * 100
  const timestamp = proposal.timestamp.getTime() / 1000

  const status = getProposalStatus(timestamp, quorumVeCrv, proposal.votesFor, proposal.votesAgainst, proposal.support)

  return {
    ...proposal,
    status,
    quorumVeCrv,
    currentQuorumPercentage,
    timestamp,
  }
}

const _fetchProposals = async (): Promise<ProposalsMapper> => {
  const pagination = 500
  const results: Proposal[] = await paginate(
    async (page, offset) => {
      const result = await getProposals(page, offset, '', 'all', 'all')
      return result.proposals
    },
    1,
    pagination,
  )

  return results.reduce((mapper, proposal) => {
    mapper[createProposalKey(proposal.id, proposal.type)] = parseProposalData(proposal)
    return mapper
  }, {} as ProposalsMapper)
}

export const { useQuery: useProposalsMapperQuery, invalidate: invalidateProposals } = queryFactory({
  queryKey: () => ['proposals-mapper'] as const,
  queryFn: _fetchProposals,
  category: 'dao.proposals',
  validationSuite: EmptyValidationSuite,
})
