import type { ProposalSortField } from '@curvefi/prices-api/proposal'

export const PROPOSAL_SORT_OPTIONS = [
  { id: 'timeCreated', label: 'Time Created', sortBy: 'timestamp' },
  { id: 'endingSoon', label: 'Ending Soon', sortBy: 'ending_soon' },
] as const satisfies readonly { id: string; label: string; sortBy: ProposalSortField }[]
