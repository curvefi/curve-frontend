import type { Proposal, ProposalType } from '@curvefi/prices-api/proposal'
import { TIME_FRAMES } from '@ui/lib/time'

const { WEEK } = TIME_FRAMES

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

export const parseProposalData = <T extends Proposal>({ timestamp: originalTimestamp, ...proposal }: T) => {
  const quorumVeCrv = proposal.quorum * proposal.totalSupply
  const currentQuorumPercentage = (proposal.votesFor / proposal.totalSupply) * 100
  const timestamp = new Date(originalTimestamp).getTime() / 1000

  const status = getProposalStatus(timestamp, quorumVeCrv, proposal.votesFor, proposal.votesAgainst, proposal.support)

  return { ...proposal, status, quorumVeCrv, currentQuorumPercentage, timestamp }
}

export type ProposalData = Omit<Proposal, 'timestamp'> & {
  status: 'Active' | 'Passed' | 'Denied'
  quorumVeCrv: number
  currentQuorumPercentage: number
  timestamp: number
}

export const createProposalKey = (proposalId: number, proposalType: ProposalType) =>
  `${proposalId}-${proposalType.toLowerCase()}`
