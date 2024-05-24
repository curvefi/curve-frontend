import { ProposalListFilterItems } from '@/components/PageProposals/types'

export const PROPOSAL_FILTERS: ProposalListFilterItems = {
  ['all']: { id: 'all', displayName: 'All' },
  ['active']: { id: 'active', displayName: 'Active' },
  ['passed']: { id: 'passed', displayName: 'Passed' },
  ['denied']: { id: 'denied', displayName: 'Denied' },
}
export const PROPOSAL_SORTING_METHODS = [
  { key: 'voteId', label: 'Proposal ID' },
  { key: 'endingSoon', label: 'Ending Soon' },
]
