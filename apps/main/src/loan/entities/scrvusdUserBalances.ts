import { queryFactory } from '@ui-kit/lib/model/query'
import useStore from '@/loan/store/useStore'
import { EmptyValidationSuite } from '@ui-kit/lib'

export type ScrvUsdUserBalances = { crvUSD: string; scrvUSD: string }

async function _fetchSavingsUserBalances({
  userAddress,
}: {
  userAddress: string
}): Promise<ScrvUsdUserBalances | null> {
  const lendApi = useStore.getState().lendApi

  if (!lendApi) return null

  const response = await lendApi.st_crvUSD.userBalances(userAddress)
  return {
    crvUSD: response.crvUSD === '0.0' ? '0' : response.crvUSD,
    scrvUSD: response.st_crvUSD === '0.0' ? '0' : response.st_crvUSD,
  }
}

export const { useQuery: useScrvUsdUserBalances, invalidate: invalidateScrvUsdUserBalances } = queryFactory({
  queryKey: (params: { userAddress: string }) =>
    ['useScrvUsdUserBalances', { userAddress: params.userAddress }] as const,
  queryFn: _fetchSavingsUserBalances,
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
