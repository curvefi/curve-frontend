import { requireLib } from '@evm-ui/features/connect-wallet'
import { createValidationSuite, type FieldsOf } from '@evm-ui/lib'
import { queryFactory, rootKeys, type ChainQuery, type UserQuery } from '@evm-ui/lib/model'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { evmAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'

type UserPoolsQuery = ChainQuery & UserQuery
type UserPoolsParams = FieldsOf<UserPoolsQuery>

export const { useQuery: useUserPools, fetchQuery: fetchUserPools } = queryFactory({
  queryKey: ({ chainId, userAddress }: UserPoolsParams) =>
    [...rootKeys.chain({ chainId }), ...rootKeys.user({ userAddress }), 'getUserPoolList'] as const,
  queryFn: async ({ userAddress }: UserPoolsQuery) => await requireLib('curveApi').getUserPoolList(userAddress),
  validationSuite: createValidationSuite((params: UserPoolsParams) => {
    curveApiValidationGroup(params, { requireRpc: true })
    chainValidationGroup(params)
    evmAddressValidationGroup({ evmAddress: params.userAddress })
  }),
  category: 'dex.user',
})
