import { paginate } from '@curvefi/prices-api/paginate'
import { getProposals, type Proposal } from '@curvefi/prices-api/proposal'
import { DEFAULT_PAGE_START_INDEX } from '@evm-ui/features/activity-table/utils'
import { queryFactory } from '@ui/features/queries/factory'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'
import { createProposalKey, parseProposalData, type ProposalData } from '../utils/proposal'

type ProposalsMapper = Record<string, ProposalData>

const _fetchProposals = async (): Promise<ProposalsMapper> => {
  const results: Proposal[] = await paginate(
    async (page, offset) => {
      const result = await getProposals(page, offset, '', 'all', 'all')
      return result.proposals
    },
    { page: DEFAULT_PAGE_START_INDEX },
  )

  return results.reduce((mapper, proposal) => {
    mapper[createProposalKey(proposal.id, proposal.type)] = parseProposalData(proposal)
    return mapper
  }, {} as ProposalsMapper)
}

export const { useQuery: useProposalsMapperQuery, invalidate: invalidateProposals } = queryFactory({
  queryKey: () => ({ name: 'proposals-mapper' }) as const,
  queryFn: _fetchProposals,
  category: 'dao.proposals',
  validationSuite: EmptyValidationSuite,
})
