import { useMemo } from 'react'
import { getTokensMapperStr } from '@/dex/store/createTokensSlice'
import useStore from '@/dex/store/useStore'
import { ChainId, type CurveApi } from '@/dex/types/main.types'
import { useConnection } from '@ui-kit/features/connect-wallet'

const useTokensMapper = (routerChainId?: ChainId | number | null) => {
  const chainId = useConnection<CurveApi>().lib?.chainId ?? 0
  const tokensMapper = useStore((state) => state.tokens.tokensMapper[routerChainId ?? chainId] ?? {})
  const tokensMapperStr = useMemo(() => getTokensMapperStr(tokensMapper), [tokensMapper])
  return { tokensMapper, tokensMapperStr }
}

export default useTokensMapper
