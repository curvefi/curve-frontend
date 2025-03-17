import { getUserStats } from '@curvefi/prices-api/savings'
import type { UserStats } from '@curvefi/prices-api/savings/models'
import { queryFactory } from '@ui-kit/lib/model/query'
import { userAddressValidationSuite } from '@ui-kit/lib/model/query/user-address-validation'

const _fetchScrvUsdUserStats = async ({ userAddress }: { userAddress: string }): Promise<UserStats> =>
  await getUserStats(userAddress)

export const { useQuery: useScrvUsdUserStats } = queryFactory({
  queryKey: (params: { userAddress: string }) => ['scrvUsdUserStats', { userAddress: params.userAddress }] as const,
  queryFn: _fetchScrvUsdUserStats,
  validationSuite: userAddressValidationSuite,
})
