import { ContractParams, ContractQuery, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'
import { memoize } from 'lodash'
import type { Address, Chain } from '@curvefi/prices-api'
import { getChains, getSnapshots } from '@curvefi/prices-api/llamalend'

// todo: move to a separate query
const getSupportedChains = memoize(getChains)

export const { useQuery: useLendingSnapshots } = queryFactory({
  queryKey: (params: ContractParams) => [...rootKeys.contract(params), 'lendingSnapshots'] as const,
  queryFn: async ({ blockchainId, contractAddress }: ContractQuery): ReturnType<typeof getSnapshots> => {
    const chain = blockchainId as Chain
    const chains = await getSupportedChains()
    if (!chains.includes(chain)) return [] // backend gives 404 for optimism

    return getSnapshots({
      chain,
      marketController: contractAddress as Address,
      fetchOnChain: true,
      agg: 'none',
      sortBy: 'desc',
    })
  },
  staleTime: '1h',
  validationSuite: contractValidationSuite,
})
