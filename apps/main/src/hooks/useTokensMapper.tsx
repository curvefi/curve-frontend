import { useMemo } from 'react'

import { getTokensMapperStr } from '@main/store/createTokensSlice'
import useStore from '@main/store/useStore'
import { useChainId } from '@main/entities/chain'
import { ChainId } from '@main/types/main.types'

const useTokensMapper = (rChainId?: ChainId | number | null) => {
  const { data: chainId } = useChainId()
  const _rChainId = (rChainId ?? chainId) as ChainId
  const tokensMapper = useStore((state) => state.tokens.tokensMapper[_rChainId] ?? {})
  const tokensMapperStr = useMemo(() => getTokensMapperStr(tokensMapper), [tokensMapper])
  return { tokensMapper, tokensMapperStr }
}

export default useTokensMapper
