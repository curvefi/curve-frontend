import { useMemo } from 'react'

import { getTokensMapperStr } from '@/store/createTokensSlice'
import useStore from '@/store/useStore'
import { useChainId } from '@/entities/chain'

const useTokensMapper = (rChainId?: ChainId) => {
  const { data: chainId } = useChainId()
  const _rChainId = rChainId ?? chainId
  const tokensMapper = useStore((state) => state.tokens.tokensMapper[_rChainId] ?? {})
  const tokensMapperStr = useMemo(() => getTokensMapperStr(tokensMapper), [tokensMapper])
  return { tokensMapper, tokensMapperStr }
}

export default useTokensMapper
