import { paginate } from '@curvefi/prices-api/paginate'
import { getUserPoolPositions, MAX_USER_POOL_PAGE_SIZE } from '@curvefi/prices-api/pools'
import { createValidationSuite } from '@evm-ui/lib'
import { queryFactory, rootKeys, type UserChainParams, type UserChainQuery } from '@evm-ui/lib/model'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import { userAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { decimalDiv, decimalSum } from '@ui/lib/decimal'

export const {
  useQuery: useUserPoolPositions,
  queryKey: getUserPoolPositionsQueryKey,
  invalidate: invalideUserPoolPositions,
} = queryFactory({
  queryKey: ({ chainId, userAddress }: UserChainParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'getUserPoolPositions'] as const,
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
