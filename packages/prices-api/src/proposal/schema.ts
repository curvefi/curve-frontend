import { z } from 'zod/v4'
import { address, camelizeKeys, timestamp } from '../schemas'

export const proposalType = z.enum(['ownership', 'parameter'])
export type ProposalType = z.infer<typeof proposalType>

export const proposalStatus = z.enum(['all', 'active', 'denied', 'passed', 'executed'])
export type ProposalStatus = z.infer<typeof proposalStatus>

const proposalShape = {
  vote_id: z.number(),
  vote_type: proposalType,
  creator: address,
  start_date: z.number(),
  snapshot_block: z.number(),
  ipfs_metadata: z.string().nullable().optional(),
  metadata: z.string().nullable().optional(),
  votes_for: z.string(),
  votes_against: z.string(),
  vote_count: z.number(),
  support_required: z.string(),
  min_accept_quorum: z.string(),
  total_supply: z.string(),
  executed: z.boolean(),
  execution_tx: address.nullable(),
  execution_date: timestamp.nullable(),
  transaction_hash: address,
  dt: timestamp,
}

const rawProposal = z.object(proposalShape).transform(camelizeKeys)
type RawProposal = z.infer<typeof rawProposal>

// Voting power in veCRV.
const transformProposal = (data: RawProposal) => ({
  timestamp: data.dt,
  id: data.voteId,
  type: data.voteType,
  metadata: data.metadata?.startsWith('"') // Remove weird starting quote, if present.
    ? data.metadata.substring(1)
    : (data.metadata ?? ''),
  proposer: data.creator,
  block: data.snapshotBlock,
  start: data.startDate,
  end: data.startDate + 604800,
  quorum: Number(BigInt(data.minAcceptQuorum)) / 10 ** 18,
  support: Number(BigInt(data.supportRequired)) / 10 ** 18,
  voteCount: data.voteCount, // An actual vote *count*
  votesFor: Number(BigInt(data.votesFor)) / 10 ** 18,
  votesAgainst: Number(BigInt(data.votesAgainst)) / 10 ** 18,
  executionTx: data.executionTx,
  executionDate: data.executionDate ?? null,
  executed: data.executed,
  totalSupply: Number(BigInt(data.totalSupply)) / 10 ** 18,
  txCreation: data.transactionHash,
})

const proposal = rawProposal.transform(transformProposal)

const vote = z
  .object({
    voter: address,
    supports: z.boolean(),
    voting_power: z.string(),
    transaction_hash: address,
  })
  .transform(camelizeKeys)

export const getProposalsResponse = z
  .object({
    proposals: z.array(proposal),
    count: z.number(),
  })
  .transform(({ proposals, count }) => ({
    proposals,
    count,
  }))

export const getProposalDetailsResponse = z
  .object({
    ...proposalShape,
    script: z.string().nullable(),
    votes: z.array(vote),
  })
  .transform(camelizeKeys)
  .transform(({ executionTx, script, votes, ...details }) => ({
    ...transformProposal({ ...details, executionTx }),
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
    txExecution: executionTx ? executionTx : undefined,
    script: script ?? '',
    votes: votes.map(item => ({
      voter: item.voter,
      supports: item.supports,
      votingPower: Number(BigInt(item.votingPower)) / 10 ** 18,
      txHash: item.transactionHash,
    })),
  }))

const userProposalVote = z
  .object({
    proposal: rawProposal,
    votes: z.array(vote),
  })
  .transform(({ proposal, votes }) => ({
    proposal: transformProposal(proposal),
    votes: votes.map(item => ({
      voter: item.voter,
      supports: item.supports,
      weight: BigInt(Math.round(parseFloat(item.votingPower))),
      txHash: item.transactionHash,
    })),
  }))

export const getUserProposalVotesResponse = z
  .object({
    page: z.number(),
    count: z.number(),
    data: z.array(userProposalVote),
  })
  .transform(({ data }) => data)

export const getUserProposalVoteResponse = userProposalVote

export type Proposal = z.infer<typeof proposal>
export type ProposalDetails = Omit<z.infer<typeof getProposalDetailsResponse>, keyof Proposal>
export type UserProposalVote = z.infer<typeof userProposalVote>
