import { useMemo } from 'react'

import { getTokensMapperStr } from '@/dex/store/createTokensSlice'
import useStore from '@/dex/store/useStore'
import { useChainId } from '@/dex/entities/chain'

const useTokensMapper = (rChainId?: ChainId | number | null) => {
  const { data: chainId } = useChainId()
  const _rChainId = (rChainId ?? chainId) as ChainId
  const tokensMapper = useStore((state) => state.tokens.tokensMapper[_rChainId] ?? {})
  const tokensMapperStr = useMemo(() => getTokensMapperStr(tokensMapper), [tokensMapper])
  return { tokensMapper, tokensMapperStr }
}

export default useTokensMapper
