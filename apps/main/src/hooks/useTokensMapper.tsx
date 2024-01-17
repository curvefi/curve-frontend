import { useMemo } from 'react'

import { getTokensMapperStr } from '@/store/createTokensSlice'
import useStore from '@/store/useStore'

const useTokensMapper = (rChainId: ChainId | '') => {
  const cached = useStore((state) => state.storeCache.tokensMapper[rChainId])
  const api = useStore((state) => state.tokens.tokensMapper[rChainId])
  const tokensMapper = useMemo(() => api ?? cached ?? {}, [api, cached])
  const tokensMapperStr = useMemo(() => getTokensMapperStr(tokensMapper), [tokensMapper])
  return { tokensMapper, tokensMapperStr }
}

export default useTokensMapper
