import useStore from '@/store/useStore'
import { useMemo } from 'react'
import { FETCHING, PartialQueryResult, READY } from '@/shared/lib/queries'

export const useApi = (): PartialQueryResult<Api> => {
  const api = useStore((state) => state.api)
  return useMemo(() => (api ? { ...READY, data: api } : FETCHING), [api])
}

export const useChainId = (): PartialQueryResult<ChainId> => {
  const apiResult = useApi();
  return useMemo(() => ({...apiResult, data: apiResult?.data?.chainId}), [apiResult])
}
