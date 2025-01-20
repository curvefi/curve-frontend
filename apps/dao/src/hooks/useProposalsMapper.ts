import { useMemo } from 'react'

import useStore from '@dao/store/useStore'

const useProposalsMapper = () => {
  const cached = useStore((state) => state.storeCache.cacheProposalsMapper)
  const api = useStore((state) => state.proposals.proposalsMapper)
  const proposalsMapper = useMemo(() => api ?? cached ?? {}, [api, cached])
  return { proposalsMapper }
}

export default useProposalsMapper
