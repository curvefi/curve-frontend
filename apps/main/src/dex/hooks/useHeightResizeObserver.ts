import type { RefObject } from 'react'

import { useEffect, useState } from 'react'

function useHeightResizeObserver(elementRef: RefObject<Element>) {
  const [height, setHeight] = useState<number | null>(null)

  const updateEntry = ([updatedEntry]: ResizeObserverEntry[]): void => {
    const updatedHeight = Math.round(updatedEntry?.contentRect.height || 0)

    setHeight((prev) => {
      if (prev === null) return prev

      if (updatedHeight > prev + 10) {
        return updatedHeight
      } else {
        return prev
      }
    })
  }

  useEffect(() => {
    const node = elementRef?.current

    if (!node) return

    const domRect = node.getBoundingClientRect()
    setHeight(domRect.height)

    const observer = new ResizeObserver(updateEntry)
    observer.observe(node)

    return () => {
      observer?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementRef])

  return height
}

export default useHeightResizeObserver
