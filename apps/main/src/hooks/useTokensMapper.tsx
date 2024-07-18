import { useMemo } from 'react'

import { getTokensMapperStr } from '@/store/createTokensSlice'
import useStore from '@/store/useStore'

const useTokensMapper = (rChainId: ChainId | '') => {
  const tokensMapper = useStore((state) => state.tokens.tokensMapper[rChainId] ?? {})
  const tokensMapperStr = useMemo(() => getTokensMapperStr(tokensMapper), [tokensMapper])
  return { tokensMapper, tokensMapperStr }
}

export default useTokensMapper
