import {
  getProposals,
  type ProposalSortField,
  type ProposalSortOrder,
  type ProposalStatus,
} from '@curvefi/prices-api/proposal'
import { queryFactory } from '@ui/features/queries/factory'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'
import { parseProposalData } from '../utils/proposal'

type ProposalsParams = {
  page: number
  pageSize: number
  search: string
  status: ProposalStatus
  sortBy: ProposalSortField
  sortOrder: ProposalSortOrder
}

const flipSortOrder = (order: ProposalSortOrder) => (order === 'asc' ? 'desc' : 'asc')

export const { useQuery: useProposalsQuery } = queryFactory({
  queryKey: (params: ProposalsParams) => ({ name: 'proposals', ...params }) as const,
  queryFn: async ({ page, pageSize, search, status, sortBy, sortOrder }: ProposalsParams) => {
    // Flip the sort order just before sending out the API request when sorting by ending soon.
    // We want the opposite order to happen without the UI or URL having to change. A bit weird but it's better UX.
    sortOrder = sortBy === 'ending_soon' ? flipSortOrder(sortOrder) : sortOrder

    const { proposals, count } = await getProposals(page, pageSize, search, 'all', status, { sortBy, sortOrder })
    return { proposals: proposals.map(parseProposalData), count }
  },
  category: 'dao.proposals',
  validationSuite: EmptyValidationSuite,
  keepPreviousData: true, // Prevent flashing when changing page on proposals list.
})
