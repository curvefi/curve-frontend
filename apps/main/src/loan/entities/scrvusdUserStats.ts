import type { UserStats } from '@curvefi/prices-api/savings/models'
import { queryFactory, type UserAddressParams, type UserAddressQuery } from '@ui-kit/lib/model/query'
import { getUserStats } from '@curvefi/prices-api/savings'
import { userAddressValidationSuite } from '@ui-kit/lib/model/query/user-address-validation'

export const { useQuery: useScrvUsdUserStats } = queryFactory({
  queryKey: (params: UserAddressParams) => ['scrvUsdUserStats', { userAddress: params.userAddress }] as const,
  queryFn: ({ userAddress }: UserAddressQuery): Promise<UserStats> => getUserStats(userAddress),
  staleTime: '5m',
  validationSuite: userAddressValidationSuite,
})
