import { z } from 'zod/v4'
import { address, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

export const proposalType = z.enum(['ownership', 'parameter'])
export type ProposalType = z.infer<typeof proposalType>

export const proposalStatus = z.enum(['all', 'active', 'denied', 'passed', 'executed'])
export type ProposalStatus = z.infer<typeof proposalStatus>

const normalizeProposalType = (type: ProposalType): ProposalType =>
  type.toLocaleLowerCase() === 'parameter' ? 'parameter' : 'ownership'

const proposal = z
  .object({
    vote_id: z.number(),
    vote_type: proposalType,
    creator: address,
    start_date: z.number(),
    snapshot_block: z.number(),
    ipfs_metadata: z.string(),
    metadata: z.string().optional(),
    votes_for: z.string(),
    votes_against: z.string(),
    vote_count: z.number(),
    support_required: z.string(),
    min_accept_quorum: z.string(),
    total_supply: z.string(),
    executed: z.boolean(),
    execution_tx: address.nullable(),
    execution_date: timestampResponse.nullable(),
    transaction_hash: address,
    dt: timestampResponse,
  })
  .transform(data => ({
    timestamp: parseTimestamp(data.dt),
    id: data.vote_id,
    type: normalizeProposalType(data.vote_type),
    metadata: data.metadata?.startsWith('"') // Remove weird starting quote, if present.
      ? data.metadata.substring(1)
      : (data.metadata ?? ''),
    proposer: data.creator,
    block: data.snapshot_block,
    start: data.start_date,
    end: data.start_date + 604800,
    quorum: Number(BigInt(data.min_accept_quorum)) / 10 ** 18, // Voting power in veCRV.
    support: Number(BigInt(data.support_required)) / 10 ** 18, // Voting power in veCRV.
    voteCount: data.vote_count, // An actual vote *count*
    votesFor: Number(BigInt(data.votes_for)) / 10 ** 18, // Voting power in veCRV.
    votesAgainst: Number(BigInt(data.votes_against)) / 10 ** 18, // Voting power in veCRV.
    executionTx: data.execution_tx,
    executionDate: data.execution_date ? parseTimestamp(data.execution_date) : null,
    executed: data.executed,
    totalSupply: Number(BigInt(data.total_supply)) / 10 ** 18, // Voting power in veCRV.
    txCreation: data.transaction_hash,
  }))

const vote = z.object({
  voter: address,
  supports: z.boolean(),
  voting_power: z.string(),
  transaction_hash: address,
})

export const getProposalsResponse = z
  .object({
    proposals: z.array(proposal),
    count: z.number(),
  })
  .transform(data => ({
    proposals: data.proposals,
    count: data.count,
  }))

export const getProposalDetailsResponse = z
  .object({
    vote_id: z.number(),
    vote_type: proposalType,
    creator: address,
    start_date: z.number(),
    snapshot_block: z.number(),
    ipfs_metadata: z.string(),
    metadata: z.string().optional(),
    votes_for: z.string(),
    votes_against: z.string(),
    vote_count: z.number(),
    support_required: z.string(),
    min_accept_quorum: z.string(),
    total_supply: z.string(),
    executed: z.boolean(),
    execution_tx: address.nullable(),
    execution_date: timestampResponse.nullable(),
    transaction_hash: address,
    dt: timestampResponse,
    script: z.string(),
    votes: z.array(vote),
  })
  .transform(data => ({
    ...proposal.parse(data),
    txExecution: data.execution_tx ? data.execution_tx : undefined,
    script: data.script,
    votes: data.votes.map(item => ({
      voter: item.voter,
      supports: item.supports,
      votingPower: Number(BigInt(item.voting_power)) / 10 ** 18,
      txHash: item.transaction_hash,
    })),
  }))

const userProposalVote = z
  .object({
    proposal: z.object({
      vote_id: z.number(),
      vote_type: proposalType,
      creator: address,
      start_date: z.number(),
      snapshot_block: z.number(),
      ipfs_metadata: z.string(),
      metadata: z.string().optional(),
      votes_for: z.string(),
      votes_against: z.string(),
      vote_count: z.number(),
      support_required: z.string(),
      min_accept_quorum: z.string(),
      total_supply: z.string(),
      executed: z.boolean(),
      execution_tx: address.nullable(),
      execution_date: timestampResponse.nullable(),
      transaction_hash: address,
      dt: timestampResponse,
    }),
    votes: z.array(vote),
  })
  .transform(data => ({
    proposal: proposal.parse(data.proposal),
    votes: data.votes.map(item => ({
      voter: item.voter,
      supports: item.supports,
      weight: BigInt(Math.round(parseFloat(item.voting_power))),
      txHash: item.transaction_hash,
    })),
  }))

export const getUserProposalVotesResponse = z
  .object({
    page: z.number(),
    count: z.number(),
    data: z.array(userProposalVote),
  })
  .transform(data => data.data)

export const getUserProposalVoteResponse = userProposalVote

export type Proposal = z.infer<typeof proposal>
export type ProposalDetails = Omit<z.infer<typeof getProposalDetailsResponse>, keyof Proposal>
export type UserProposalVote = z.infer<typeof userProposalVote>
