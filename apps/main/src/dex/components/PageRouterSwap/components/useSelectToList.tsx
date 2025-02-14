import { useMemo } from 'react'

import useStore from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'

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
