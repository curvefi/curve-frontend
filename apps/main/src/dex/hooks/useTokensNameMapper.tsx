import { useMemo } from 'react'

import useStore from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'

const useTokensNameMapper = (rChainId: ChainId | '') => {
  const tokensNameMapper = useStore((state) => state.tokens.tokensNameMapper[rChainId] ?? {})
  const tokensNameMapperStr = useMemo(
    () =>
      Object.keys(tokensNameMapper).reduce((str, address) => {
        str += address.charAt(5)
        return str
      }, ''),
    [tokensNameMapper],
  )
  return { tokensNameMapper, tokensNameMapperStr }
}

export default useTokensNameMapper
