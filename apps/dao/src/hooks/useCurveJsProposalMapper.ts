import { useMemo } from 'react'

import useStore from '@/store/useStore'

const useCurveJsProposalMapper = () => {
  const cached = useStore((state) => state.storeCache.cacheCurveJsProposalMapper)
  const api = useStore((state) => state.proposals.curveJsProposalMapper)
  const curveJsProposalMapper = useMemo(() => api ?? cached ?? {}, [api, cached])
  return { curveJsProposalMapper }
}

export default useCurveJsProposalMapper
