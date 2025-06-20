import { toDate } from '../timestamp'
import type * as Models from './models'
import type * as Responses from './responses'

export const parseProposal = (x: Responses.GetProposalsResponse['proposals'][number]): Models.Proposal => ({
  timestamp: toDate(x.dt),
  id: x.vote_id,
  type: x.vote_type.toLocaleLowerCase() === 'parameter' ? 'parameter' : 'ownership',
  metadata: x.metadata?.startsWith('"') // Remove weird starting quote, if present.
    ? x.metadata.substring(1)
    : (x.metadata ?? ''),
  proposer: x.creator,
  block: x.snapshot_block,
  start: x.start_date,
  end: x.start_date + 604800,
  quorum: Number(BigInt(x.min_accept_quorum)) / 10 ** 18,
  support: Number(BigInt(x.support_required)) / 10 ** 18,
  voteCount: x.vote_count,
  votesFor: Number(BigInt(x.votes_for)) / 10 ** 18,
  votesAgainst: Number(BigInt(x.votes_against)) / 10 ** 18,
  executionTx: x.execution_tx,
  executionDate: x.execution_date ? toDate(x.execution_date) : null,
  executed: x.executed,
  totalSupply: Number(BigInt(x.total_supply)) / 10 ** 18,
  txCreation: x.transaction_hash,
})

export const parseProposalDetails = (
  x: Responses.GetProposalDetailsResponse,
): Models.Proposal & Models.ProposalDetails => ({
  ...parseProposal(x),
  txExecution: x.execution_tx ? x.execution_tx : undefined,
  script: x.script,
  votes: x.votes.map((vote) => ({
    voter: vote.voter,
    supports: vote.supports,
    votingPower: Number(BigInt(vote.voting_power)) / 10 ** 18,
    txHash: vote.transaction_hash,
  })),
})

export const parseUserProposalVote = (x: Responses.GetUserProposalVotes['data'][number]): Models.UserProposalVote => ({
  proposal: parseProposal(x.proposal),
  votes: x.votes.map((vote) => ({
    voter: vote.voter,
    supports: vote.supports,
    weight: BigInt(Math.round(parseFloat(vote.voting_power))),
    txHash: vote.transaction_hash,
  })),
})
