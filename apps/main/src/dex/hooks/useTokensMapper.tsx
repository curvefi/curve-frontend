import { useMemo } from 'react'
import { getTokensMapperStr } from '@/dex/store/createTokensSlice'
import { useStore } from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'
import { useCurve } from '@ui-kit/features/connect-wallet'

export const useTokensMapper = (routerChainId?: ChainId | number | null) => {
  const chainId = useCurve().curveApi?.chainId ?? 0
  const tokensMapperState = useStore((state) => state.tokens.tokensMapper[routerChainId ?? chainId])
  const tokensMapper = useMemo(() => tokensMapperState || {}, [tokensMapperState])
  return {
    tokensMapper,
    tokensMapperStr: useMemo(() => getTokensMapperStr(tokensMapper), [tokensMapper]),
  }
}
