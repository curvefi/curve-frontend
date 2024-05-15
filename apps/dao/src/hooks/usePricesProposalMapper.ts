import { useMemo } from 'react'

import useStore from '@/store/useStore'

const usePricesProposalMapper = () => {
  const cached = useStore((state) => state.storeCache.cachePricesProposalMapper)
  const api = useStore((state) => state.proposals.pricesProposalMapper)
  const pricesProposalMapper = useMemo(() => api ?? cached ?? {}, [api, cached])
  return { pricesProposalMapper }
}

export default usePricesProposalMapper
