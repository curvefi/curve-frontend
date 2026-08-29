import type { FuseOptionKey } from 'fuse.js'
import type { ProposalData } from '@/dao/entities/proposals'
import { useFuzzyFilterFn } from '@evm-ui/hooks/useFuzzySearch'

const PROPOSAL_SEARCH_KEYS = [
  { name: 'id', getFn: (proposal: ProposalData) => String(proposal.id) },
  'proposer',
  'type',
  'metadata',
] as const satisfies readonly FuseOptionKey<ProposalData>[]

/** Client-side fuzzy search filter for proposals. */
export const useProposalsGlobalFilterFn = (data: readonly ProposalData[], filterValue: string) =>
  useFuzzyFilterFn(data, filterValue, PROPOSAL_SEARCH_KEYS)
