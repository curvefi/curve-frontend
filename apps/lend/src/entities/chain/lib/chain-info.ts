import useStore from '@/store/useStore'
import { useMemo } from 'react'
import { FETCHING, PartialQueryResult, READY } from '@/shared/lib/queries'

export const useChainId = (): PartialQueryResult<ChainId> => {
  const api = useStore((state) => state.api)
  return useMemo(() => (api ? { ...READY, data: api.chainId } : FETCHING), [api])
}
