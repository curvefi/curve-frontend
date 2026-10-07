import { paginate } from '@curvefi/prices-api/paginate'
import { getUserPoolPositions, MAX_USER_POOL_PAGE_SIZE } from '@curvefi/prices-api/pools'
import type { UserChainParams, UserChainQuery } from '@evm-ui/queries/query-types'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { userAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { queryFactory } from '@ui/features/queries/factory'
import type { QueryData } from '@ui/features/queries/util'
import { decimalDiv, decimalSum } from '@ui/lib/decimal'
import { createValidationSuite } from '@ui/lib/validation/lib'

export const {
  useQuery: useUserFullPoolPositions,
  queryKey: getUserFullPoolPositionsQueryKey,
  invalidate: invalidateUserFullPoolPositions,
} = queryFactory({
  queryKey: ({ chainId, userAddress }: UserChainParams) =>
    ({ name: 'getUserPoolFullPositions', version: 2, chainId, userAddress }) as const,
  queryFn: async ({ chainId, userAddress }: UserChainQuery) => {
    const positions = await paginate(
      async (page, pagination) => (await getUserPoolPositions({ chainId, userAddress, page, pagination })).positions,
      1,
      MAX_USER_POOL_PAGE_SIZE,
    )
    return {
      chainId,
      user: userAddress,
      positions: positions.map(position => ({
        ...position,
        totalBalance: decimalDiv(decimalSum(position.lpBalance, position.gaugeBalance), '1e18'),
      })),
    }
  },
  validationSuite: createValidationSuite((params: UserChainParams) => {
    chainValidationGroup(params)
    userAddressValidationGroup(params)
  }),
  category: 'dex.user',
})

export type UserFullPoolPositions = QueryData<typeof useUserFullPoolPositions>
export type UserFullPoolPosition = UserFullPoolPositions['positions'][number]
