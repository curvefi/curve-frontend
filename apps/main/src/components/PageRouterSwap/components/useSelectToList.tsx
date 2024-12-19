import { useMemo } from 'react'

import useStore from '@/store/useStore'

const useSelectToList = (rChainId: ChainId | '') => {
  const selectToList = useStore((state) => state.quickSwap.selectToList[rChainId])
  const selectToListStr = useMemo(
    () =>
      (selectToList ?? []).reduce((str, address) => {
        str += address.charAt(5)
        return str
      }, ''),
    [selectToList],
  )
  return { selectToList, selectToListStr }
}

export default useSelectToList
