import { invalidateProposals, type ProposalData, type ProposalsByKey, useProposals } from '@/dao/entities/proposals'
import { useMappedQuery } from '@evm-ui/types/util'

const proposalsToArray = (proposals: ProposalsByKey): ProposalData[] => Object.values(proposals)

/** Fetches proposals and adapts their keyed query data for the proposals table. */
export const useProposalsTable = () => {
  const proposalsQuery = useProposals({})
  const tableQuery = useMappedQuery(proposalsQuery, proposalsToArray)

  return {
    tableQuery,
    isFetching: proposalsQuery.isFetching,
    onReload: () => invalidateProposals({}),
  }
}
