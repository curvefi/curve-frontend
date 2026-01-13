import { useMemo } from 'react'
import { useStore } from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'

export const useTokensNameMapper = (rChainId: ChainId | '') => {
  const tokensNameMapper = useStore((state) => state.tokens.tokensNameMapper[rChainId])
  return {
    tokensNameMapper: tokensNameMapper || {},
    tokensNameMapperStr: useMemo(
      () => Object.keys(tokensNameMapper || {}).reduce((str, address) => str + address.charAt(5), ''),
      [tokensNameMapper],
    ),
  }
}
