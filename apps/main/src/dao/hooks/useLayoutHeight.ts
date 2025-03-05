import type { LayoutHeight } from '@/dao/store/createAppSlice'
import { RefObject, useEffect } from 'react'
import useStore from '@/dao/store/useStore'

function useLayoutHeight(elementRef: RefObject<Element | null>, key: keyof LayoutHeight) {
  const pageWidth = useStore((state) => state.layout.pageWidth)
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
