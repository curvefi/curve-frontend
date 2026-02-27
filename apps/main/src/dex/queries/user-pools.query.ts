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
  queryFn: async ({ userAddress }: UserPoolsQuery) => await requireLib('curveApi').getUserPoolList(userAddress),
  validationSuite: createValidationSuite((params: UserPoolsParams) => {
    curveApiValidationGroup(params, { requireRpc: true })
    chainValidationGroup(params)
    userAddressValidationGroup(params)
  }),
  category: 'user',
})
