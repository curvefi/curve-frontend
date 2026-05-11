import { getLib } from 'curve-ui-kit/src/features/connect-wallet'
import { PartialQueryResult, FETCHING_QUERY_RESULT, RESOLVED_QUERY_RESULT } from 'curve-ui-kit/src/lib/queries'
import { useMemo } from 'react'
import { ChainId } from '../types/lend.types'

export const useChainId = (): PartialQueryResult<ChainId> => {
  const api = getLib('llamaApi')
  const apiResult = useMemo(() => (api ? { ...RESOLVED_QUERY_RESULT, data: api } : FETCHING_QUERY_RESULT), [api])
  return useMemo(() => ({ ...apiResult, data: apiResult?.data?.chainId }), [apiResult])
}
