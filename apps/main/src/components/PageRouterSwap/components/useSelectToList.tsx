import { useMemo } from 'react'

import useStore from '@/store/useStore'

const useSelectToList = (rChainId: ChainId | '') => {
  const cached = useStore((state) => state.storeCache.routerSelectToList[rChainId])
  const api = useStore((state) => state.quickSwap.selectToList[rChainId])
  const selectToList = useMemo(() => api ?? cached ?? [], [api, cached])
  const selectToListStr = useMemo(() => {
    return selectToList.reduce((str, address) => {
      str += address.charAt(5)
      return str
    }, '')
  }, [selectToList])
  return { selectToList, selectToListStr }
}

export default useSelectToList
