import type { LayoutHeight } from '@/loan/store/types'

import React, { useEffect } from 'react'

import useStore from '@/loan/store/useStore'

function useLayoutHeight(elementRef: React.RefObject<Element | null>, key: keyof LayoutHeight) {
  const pageWidth = useStore((state) => state.layout.pageWidth)
  const setLayoutHeight = useStore((state) => state.layout.setLayoutHeight)

  useEffect(() => {
    if (elementRef?.current) {
      const domRect = elementRef.current.getBoundingClientRect()
      setLayoutHeight(key, domRect.height)
    }

    return () => {
      setLayoutHeight(key, 0)
    }
  }, [elementRef, key, setLayoutHeight, pageWidth])
}

export default useLayoutHeight
