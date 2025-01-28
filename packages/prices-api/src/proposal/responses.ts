import type { Address } from '..'
import type { ProposalType } from './models'

type Proposal = {
  vote_id: number
  vote_type: ProposalType
  creator: Address
  start_date: number
  snapshot_block: number
  ipfs_metadata: string
  metadata?: string
  votes_for: string
  votes_against: string
  vote_count: number
  support_required: string
  min_accept_quorum: string
  total_supply: string
  executed: boolean
  transaction_hash: Address
  dt: string
}

export type GetProposalsResponse = {
  proposals: Proposal[]
  count: number
}

export type GetProposalDetailsResponse = Proposal & {
  execution_tx: Address | null
  script: string
  votes: {
    voter: Address
    supports: boolean
    voting_power: string
  }[]
}

export type GetUserProposalVotes = {
  page: number
  count: number
  data: {
    proposal: Proposal
    votes: {
      voter: Address
      supports: boolean
      voting_power: string
      transaction_hash: Address
    }[]
  }[]
}
