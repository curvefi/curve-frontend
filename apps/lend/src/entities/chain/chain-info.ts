import { useMemo } from 'react'
import { FETCHING, PartialQueryResult, READY } from '@/shared/lib/queries'
import useStore from '@/store/useStore'

export const useChainId = (): PartialQueryResult<ChainId> => {
  const api = useStore((state) => state.api)
  const apiResult = useMemo(() => (api ? { ...READY, data: api } : FETCHING), [api])
  return useMemo(() => ({ ...apiResult, data: apiResult?.data?.chainId }), [apiResult])
}
