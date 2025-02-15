import { queryFactory } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { getUserStats } from '@curvefi/prices-api/savings'
import type { UserStats } from '@curvefi/prices-api/savings/models'

async function _fetchScrvUsdUserStats({ userAddress }: { userAddress: string }): Promise<UserStats> {
  const data = await getUserStats(userAddress)

  return data
}

export const { useQuery: useScrvUsdUserStats } = queryFactory({
  queryKey: (params: { userAddress: string }) => ['scrvUsdUserStats', { userAddress: params.userAddress }] as const,
  queryFn: _fetchScrvUsdUserStats,
  staleTime: '5m',
  validationSuite: createValidationSuite(() => {}),
})
