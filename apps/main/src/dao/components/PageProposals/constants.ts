import { ProposalColumnId, type ProposalSortBy, type ProposalStatusFilter } from './columns'

export const PROPOSAL_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'passed', label: 'Passed' },
  { key: 'executable', label: 'Executable' },
  { key: 'denied', label: 'Denied' },
] as const satisfies readonly { key: ProposalStatusFilter; label: string }[]

export const PROPOSAL_SORTING_METHODS = [
  { key: ProposalColumnId.TimeCreated, label: 'Time Created' },
  { key: ProposalColumnId.EndingSoon, label: 'Ending Soon' },
] as const satisfies readonly { key: ProposalSortBy; label: string }[]
