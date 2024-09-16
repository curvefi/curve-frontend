import { useMemo } from 'react'

import { getTokensMapperStr } from '@/store/createTokensSlice'
import useStore from '@/store/useStore'
import { useChainId } from '@/entities/chain'
import { useTokenMapping } from '@/entities/token'

const useTokensMapper = (rChainId?: ChainId) => {
  const { data: chainId } = useChainId()
  const _rChainId = rChainId ?? chainId
  const pools = useStore((state) => state.pools.pools[_rChainId])
  const tokensMapper = useTokenMapping(_rChainId, pools)
  const tokensMapperStr = useMemo(() => getTokensMapperStr(tokensMapper), [tokensMapper])
  return { tokensMapper, tokensMapperStr }
}

export default useTokensMapper
