import { useMemo } from 'react'

import useStore from '@/store/useStore'

const useTokensNameMapper = (rChainId: ChainId | '') => {
  const cached = useStore((state) => state.storeCache.tokensNameMapper[rChainId])
  const api = useStore((state) => state.tokens.tokensNameMapper[rChainId])
  const tokensNameMapper = useMemo(() => api ?? cached ?? {}, [api, cached])
  const tokensNameMapperStr = useMemo(() => {
    return Object.keys(tokensNameMapper).reduce((str, address) => {
      str += address.charAt(5)
      return str
    }, '')
  }, [tokensNameMapper])
  return { tokensNameMapper, tokensNameMapperStr }
}

export default useTokensNameMapper
