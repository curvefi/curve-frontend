import { getUserPoolPositions } from '@curvefi/prices-api/pools'
import { createValidationSuite } from '@evm-ui/lib'
import { queryFactory, rootKeys, type UserChainParams, type UserChainQuery } from '@evm-ui/lib/model'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import { userAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'

export const {
  useQuery: useUserPoolPositions,
  invalidate: invalideUserPoolPositions,
  reset: resetUserPoolPositions,
} = queryFactory({
  queryKey: ({ chainId, userAddress }: UserChainParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'getUserPoolPositions'] as const,
  queryFn: ({ chainId, userAddress }: UserChainQuery) => getUserPoolPositions({ chainId, userAddress }),
  validationSuite: createValidationSuite((params: UserChainParams) => {
    chainValidationGroup(params)
    userAddressValidationGroup(params)
  }),
  category: 'dex.user',
})
