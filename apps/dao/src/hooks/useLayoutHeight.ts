import type { LayoutHeight } from '@/store/createAppSlice'

import React, { useEffect } from 'react'

import useStore from '@/store/useStore'

function useLayoutHeight(elementRef: React.RefObject<Element>, key: keyof LayoutHeight) {
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
