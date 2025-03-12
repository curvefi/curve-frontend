import { RefObject, useEffect } from 'react'
import type { LayoutHeight } from '@/dex/store/createGlobalSlice'
import useStore from '@/dex/store/useStore'

function useLayoutHeight(elementRef: RefObject<Element | null>, key: keyof LayoutHeight) {
  const pageWidth = useStore((state) => state.pageWidth)
  const updateLayoutHeight = useStore((state) => state.updateLayoutHeight)

  useEffect(() => {
    if (elementRef?.current) {
      const domRect = elementRef.current.getBoundingClientRect()
      updateLayoutHeight(key, domRect.height)
    }

    return () => {
      updateLayoutHeight(key, 0)
    }
  }, [elementRef, key, updateLayoutHeight, pageWidth])
}

export default useLayoutHeight
