import type { Address } from '@primitives/address.utils'

export const proposalTypes = ['ownership', 'parameter'] as const
export type ProposalType = (typeof proposalTypes)[number]

export const proposalStatusses = ['all', 'active', 'denied', 'passed', 'executed'] as const
export type ProposalStatus = (typeof proposalStatusses)[number]

export type Proposal = {
  timestamp: Date
  id: number
  type: ProposalType
  metadata: string
  proposer: Address
  block: number
  start: number
  end: number
  quorum: number // Voting power in veCRV.
  support: number // Voting power in veCRV.
  voteCount: number // An actual vote *count*
  votesFor: number // Voting power in veCRV.
  votesAgainst: number // Voting power in veCRV.
  executed: boolean
  executionTx: Address | null
  executionDate: Date | null
  totalSupply: number // Voting power in veCRV.
  txCreation: Address
}

export type ProposalDetails = {
  txExecution?: Address
  script: string
  votes: {
    voter: Address
    supports: boolean
    votingPower: number
    txHash: Address
  }[]
}

export type UserProposalVote = {
  proposal: Proposal
  votes: {
    voter: Address
    supports: boolean
    weight: bigint
    txHash: Address
  }[]
}
