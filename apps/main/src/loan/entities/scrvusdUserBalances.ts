import { queryFactory } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'
import useStore from '@/loan/store/useStore'

export type ScrvUsdUserBalances = {
  crvUSD: string
  scrvUSD: string
}

async function _fetchSavingsUserBalances({
  signerAddress,
}: {
  signerAddress: string
}): Promise<ScrvUsdUserBalances | null> {
  const lendApi = useStore.getState().lendApi

  if (!signerAddress) return null
  if (!lendApi) return null

  const response = await lendApi.st_crvUSD.userBalances(signerAddress)
  return {
    crvUSD: response.crvUSD === '0.0' ? '0' : response.crvUSD,
    scrvUSD: response.st_crvUSD === '0.0' ? '0' : response.st_crvUSD,
  }
}

export const { useQuery: useScrvUsdUserBalances, invalidate: invalidateScrvUsdUserBalances } = queryFactory({
  queryKey: (params: { signerAddress: string }) =>
    ['useScrvUsdUserBalances', { signerAddress: params.signerAddress }] as const,
  queryFn: _fetchSavingsUserBalances,
  staleTime: '5m',
  validationSuite: createValidationSuite(() => {}),
})
