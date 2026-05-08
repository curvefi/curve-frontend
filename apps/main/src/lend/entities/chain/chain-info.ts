import { useMemo } from 'react'
import { ChainId } from '@/lend/types/lend.types'
import { getLib } from '@ui-kit/features/connect-wallet'
import { PartialQueryResult, FETCHING_QUERY_RESULT, RESOLVED_QUERY_RESULT } from '@ui-kit/lib/queries'

export const useChainId = (): PartialQueryResult<ChainId> => {
  const api = getLib('llamaApi')
  const apiResult = useMemo(() => (api ? { ...RESOLVED_QUERY_RESULT, data: api } : FETCHING_QUERY_RESULT), [api])
  return useMemo(() => ({ ...apiResult, data: apiResult?.data?.chainId }), [apiResult])
}
