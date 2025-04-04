import {
  PricesProposalResponseData,
  PricesProposalsResponse,
  ProposalData,
  ProposalType,
  ProposalsMapper,
} from '@/dao/types/dao.types'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { TIME_FRAMES } from '@ui-kit/lib/model'
import { queryFactory } from '@ui-kit/lib/model/query'

const { WEEK } = TIME_FRAMES

const getProposalStatus = (
  startDate: number,
  quorumVeCrv: number,
  votesFor: number,
  votesAgainst: number,
  minSupport: number,
): 'Active' | 'Passed' | 'Denied' => {
  const totalVotes = votesFor + votesAgainst
  const passedQuorum = votesFor >= quorumVeCrv
  const passedMinimum = (votesFor / totalVotes) * 100 > minSupport

  if (startDate + WEEK > Math.floor(Date.now() / 1000)) return 'Active'
  if (passedQuorum && passedMinimum) return 'Passed'
  return 'Denied'
}

const parseProposalData = (proposal: PricesProposalResponseData) => {
  const minAcceptQuorumPercent = (+proposal.min_accept_quorum / 1e18) * 100
  const minSupport = (+proposal.support_required / 1e18) * 100
  const totalVeCrv = +proposal.total_supply / 1e18
  const quorumVeCrv = (minAcceptQuorumPercent / 100) * totalVeCrv
  const votesFor = +proposal.votes_for / 1e18
  const votesAgainst = +proposal.votes_against / 1e18
  const currentQuorumPercentage = (votesFor / totalVeCrv) * 100

  const status = getProposalStatus(proposal.start_date, quorumVeCrv, votesFor, votesAgainst, minSupport)

  return {
    voteId: proposal.vote_id,
    voteType: proposal.vote_type.toUpperCase() as ProposalType,
    creator: proposal.creator,
    startDate: proposal.start_date,
    metadata: proposal.metadata,
    executed: proposal.executed,
    status,
    votesFor,
    votesAgainst,
    minSupport,
    minAcceptQuorumPercent,
    quorumVeCrv,
    totalVeCrv,
    totalVotes: votesFor + votesAgainst,
    currentQuorumPercentage,
    totalSupply: proposal.total_supply,
    snapshotBlock: proposal.snapshot_block,
    ipfsMetadata: proposal.ipfs_metadata,
    voteCount: proposal.vote_count,
    supportRequired: proposal.support_required,
    minAcceptQuorum: proposal.min_accept_quorum,
  }
}

const _fetchProposals = async (): Promise<ProposalsMapper> => {
  try {
    let page = 1
    const pagination = 500
    let results: PricesProposalResponseData[] = []

    while (true) {
      const proposalsRes = await fetch(
        `https://prices.curve.fi/v1/dao/proposals?pagination=${pagination}&page=${page}&status_filter=all&type_filter=all`,
      )
      const data: PricesProposalsResponse = await proposalsRes.json()
      results = results.concat(data.proposals)
      if (data.proposals.length < pagination) {
        break
      }
      page++
    }

    const proposalsMapper = results.reduce(
      (mapper, proposal) => {
        mapper[`${proposal.vote_id}-${proposal.vote_type.toUpperCase()}`] = parseProposalData(proposal)
        return mapper
      },
      {} as { [voteId: string]: ProposalData },
    )

    return proposalsMapper
  } catch (error: unknown) {
    console.error('Failed to fetch proposals:', error)
    return {}
  }
}

export const { useQuery: useProposalsMapper, invalidate: invalidateProposals } = queryFactory({
  queryKey: () => ['proposals'] as const,
  queryFn: _fetchProposals,
  validationSuite: EmptyValidationSuite,
})
