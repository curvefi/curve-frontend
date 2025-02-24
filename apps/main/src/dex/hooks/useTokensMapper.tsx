import { useMemo } from 'react'

import { getTokensMapperStr } from '@/dex/store/createTokensSlice'
import useStore from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'

const useTokensMapper = (rChainId?: ChainId | number | null) => {
  const chainId = useStore((state) => state.curve?.chainId ?? (0 as ChainId))
  const _rChainId = (rChainId ?? chainId) as ChainId
  const tokensMapper = useStore((state) => state.tokens.tokensMapper[_rChainId] ?? {})
  const tokensMapperStr = useMemo(() => getTokensMapperStr(tokensMapper), [tokensMapper])
  return { tokensMapper, tokensMapperStr }
}

export default useTokensMapper
