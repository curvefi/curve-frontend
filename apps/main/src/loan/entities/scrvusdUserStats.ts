import type { PricesUserStatsResponse } from '@/loan/store/types'
import { queryFactory } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'

async function _fetchSavingsStatistics({ userAddress }: { userAddress: string }): Promise<PricesUserStatsResponse> {
  const response = await fetch(`https://prices.curve.fi/v1/crvusd/savings/${userAddress}/stats`)

  return await response.json()
}

export const { useQuery: useScrvUsdUserStats } = queryFactory({
  queryKey: (params: { userAddress: string }) => ['scrvUsdUserStats', { userAddress: params.userAddress }] as const,
  queryFn: _fetchSavingsStatistics,
  staleTime: '5m',
  validationSuite: createValidationSuite(() => {}),
})
