import type { UserStats } from '@curvefi/prices-api/savings/models'
import { queryFactory } from '@ui-kit/lib/model/query'
import { getUserStats } from '@curvefi/prices-api/savings'
import { userAddressValidationSuite } from '@ui-kit/lib/model/query/user-address-validation'
import { EmptyValidationSuite } from '@ui-kit/lib'

async function _fetchScrvUsdUserStats({ userAddress }: { userAddress: string }): Promise<UserStats> {
  const data = await getUserStats(userAddress)

  return data
}

export const { useQuery: useScrvUsdUserStats } = queryFactory({
  queryKey: (params: { userAddress: string }) => ['scrvUsdUserStats', { userAddress: params.userAddress }] as const,
  queryFn: _fetchScrvUsdUserStats,
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
