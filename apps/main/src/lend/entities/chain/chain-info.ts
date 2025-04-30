import { useMemo } from 'react'
import { ChainId, LlamalendApi } from '@/lend/types/lend.types'
import { getLib } from '@ui-kit/features/connect-wallet'
import { FETCHING, PartialQueryResult, READY } from '@ui-kit/lib/queries'

export const useChainId = (): PartialQueryResult<ChainId> => {
  const api = getLib<LlamalendApi>()
  const apiResult = useMemo(() => (api ? { ...READY, data: api } : FETCHING), [api])
  return useMemo(() => ({ ...apiResult, data: apiResult?.data?.chainId }), [apiResult])
}
