import { useMemo } from 'react'

import useStore from '@main/store/useStore'
import { ChainId } from '@main/types/main.types'

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
