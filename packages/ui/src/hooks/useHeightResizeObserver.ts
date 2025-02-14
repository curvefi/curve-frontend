import * as React from 'react'

function useHeightResizeObserver(elementRef: React.RefObject<Element>) {
  const [height, setHeight] = React.useState<number | null>(null)

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

  React.useEffect(() => {
    const node = elementRef?.current

    if (!node) return

    const domRect = node.getBoundingClientRect()
    setHeight(domRect.height)

    const observer = new ResizeObserver(updateEntry)
    observer.observe(node)

    return () => {
      observer?.disconnect()
    }
  }, [elementRef])

  return height
}

export default useHeightResizeObserver
