import { requireLib } from '@ui-kit/features/connect-wallet'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainQuery, type UserQuery } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'

type UserPoolsQuery = ChainQuery & UserQuery
type UserPoolsParams = FieldsOf<UserPoolsQuery>

export const { useQuery: useUserPools, fetchQuery: fetchUserPools } = queryFactory({
  queryKey: ({ chainId, userAddress }: UserPoolsParams) =>
    [...rootKeys.chain({ chainId }), ...rootKeys.user({ userAddress }), 'pools'] as const,
  queryFn: async ({ userAddress }: UserPoolsQuery) => {
    const curve = requireLib('curveApi')
    // User pool list only be fetched with an RPC as it uses on chain calls
    return curve.isNoRPC ? [] : await curve.getUserPoolList(userAddress)
  },
  staleTime: '1m',
  validationSuite: createValidationSuite((params: UserPoolsParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
    userAddressValidationGroup(params)
  }),
})
