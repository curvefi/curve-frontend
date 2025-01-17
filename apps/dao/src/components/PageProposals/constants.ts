import { ProposalListFilterItem } from '@/types/dao.types'

export const PROPOSAL_FILTERS: ProposalListFilterItem[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'passed', label: 'Passed' },
  { key: 'executable', label: 'Executable' },
  { key: 'denied', label: 'Denied' },
]
export const PROPOSAL_SORTING_METHODS = [
  { key: 'timeCreated', label: 'Time Created' },
  { key: 'endingSoon', label: 'Ending Soon' },
]
