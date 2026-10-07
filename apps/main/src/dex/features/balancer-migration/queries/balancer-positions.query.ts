import type { UserChainParams, UserChainQuery } from '@evm-ui/queries/query-types'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { userAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { fetchBalancerPositions } from '../api/balancer.api'

export const { useQuery: useBalancerPositions, invalidate: invalidateBalancerPositions } = queryFactory({
  queryKey: ({ chainId, userAddress }: UserChainParams) =>
    ({ name: 'balancerPositions', chainId, userAddress }) as const,
  queryFn: ({ chainId, userAddress }: UserChainQuery) => fetchBalancerPositions(chainId, userAddress),
  category: 'dex.user',
  validationSuite: createValidationSuite((params: UserChainParams) => {
    chainValidationGroup(params)
    userAddressValidationGroup(params)
  }),
})
