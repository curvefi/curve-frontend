import { useMemo } from 'react'
import { ChainId } from '@/lend/types/lend.types'
import { FETCHING, PartialQueryResult, READY } from '@ui-kit/lib/queries'
import { useApiStore } from '@ui-kit/shared/useApiStore'

export const useChainId = (): PartialQueryResult<ChainId> => {
  const llamalend = useApiStore((state) => state.llamalend)
  const apiResult = useMemo(() => (llamalend ? { ...READY, data: llamalend } : FETCHING), [llamalend])
  return useMemo(() => ({ ...apiResult, data: apiResult?.data?.chainId }), [apiResult])
}
