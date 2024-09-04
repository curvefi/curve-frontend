import { useMemo } from 'react'

import useStore from '@/store/useStore'

const useTokensNameMapper = (rChainId: ChainId | '') => {
  const tokensNameMapper = useStore((state) => state.tokens.tokensNameMapper[rChainId] ?? {})
  const tokensNameMapperStr = useMemo(() => {
    return Object.keys(tokensNameMapper).reduce((str, address) => {
      str += address.charAt(5)
      return str
    }, '')
  }, [tokensNameMapper])
  return { tokensNameMapper, tokensNameMapperStr }
}

export default useTokensNameMapper
