import { useMemo } from 'react'
import useStore from '@/store/useStore'

const useProposalsMapper = () => {
  const cached = useStore((state) => state.storeCache.proposalsMapper)
  const api = useStore((state) => state.daoProposals.proposalsMapper)

  const proposalsMapper = useMemo(() => api ?? cached ?? {}, [cached, api])

  return { proposalsMapper }
}

export default useProposalsMapper
