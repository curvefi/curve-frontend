import { useMemo } from 'react'
import useStore from '@/dao/store/useStore'

const useProposalMapper = () => {
  const cached = useStore((state) => state.storeCache.cacheProposalMapper)
  const api = useStore((state) => state.proposals.proposalMapper)
  const proposalMapper = useMemo(() => api ?? cached ?? {}, [api, cached])
  return { proposalMapper }
}

export default useProposalMapper
