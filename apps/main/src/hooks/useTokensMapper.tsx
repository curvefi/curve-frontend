import { useMemo } from 'react'

import { getTokensMapperStr } from '@/store/createTokensSlice'
import useStore from '@/store/useStore'
import { useChainId } from '@/entities/chain'

const useTokensMapper = (rChainId?: ChainId) => {
  const { data: chainId } = useChainId()
  const _rChainId = rChainId ?? chainId
  const cached = useStore((state) => state.storeCache.tokensMapper[_rChainId])
  const api = useStore((state) => state.tokens.tokensMapper[_rChainId])
  const tokensMapper = useMemo(() => api ?? cached ?? {}, [api, cached])
  const tokensMapperStr = useMemo(() => getTokensMapperStr(tokensMapper), [tokensMapper])
  return { tokensMapper, tokensMapperStr }
}

export default useTokensMapper
