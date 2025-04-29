import { useMemo } from 'react'
import { ChainId } from '@/lend/types/lend.types'
import { FETCHING, PartialQueryResult, READY } from '@ui-kit/lib/queries'
import { useApiStore } from '@ui-kit/shared/useApiStore'

export const useChainId = (): PartialQueryResult<ChainId> => {
  const api = useApiStore((state) => state.lending)
  const apiResult = useMemo(() => (api ? { ...READY, data: api } : FETCHING), [api])
  return useMemo(() => ({ ...apiResult, data: apiResult?.data?.chainId }), [apiResult])
}
