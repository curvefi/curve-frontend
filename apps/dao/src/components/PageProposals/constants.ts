import { ProposalListFilterItem } from '@/components/PageProposals/types'

export const PROPOSAL_FILTERS: ProposalListFilterItem[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'passed', label: 'Passed' },
  { key: 'denied', label: 'Denied' },
]

export const PROPOSAL_SORTING_METHODS = [
  { key: 'voteId', label: 'Vote ID' },
  { key: 'timeRemaining', label: 'Time Remaining' },
  { key: 'totalVotes', label: 'Total Votes' },
]
