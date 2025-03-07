import { RefObject, useEffect, useState } from 'react'

export default function useSlideTabState(tabsRef: RefObject<HTMLDivElement | null>, rFormType: string | null) {
  const [selectedTabIdx, setSelectedTabIdx] = useState(0)
  const [tabPositions, setTabPositions] = useState<{ left: number; width: number; top: number }[]>([])

  // tabs positions
  useEffect(() => {
    if (!tabsRef.current) return

    const tabsNode = tabsRef.current
    const tabsDOMRect = tabsNode.getBoundingClientRect()
    const updatedTabPositions = Array.from(tabsNode.childNodes as NodeListOf<HTMLInputElement>)
      .filter((n) => n.classList.contains('tab'))
      .map((n, idx) => {
        const domRect = n.getBoundingClientRect()
        const left = idx == 0 ? 0 : domRect.left - tabsDOMRect.left
        const top = domRect.bottom - tabsDOMRect.top
        return { left, width: domRect.width, top }
      })

    setTabPositions(updatedTabPositions)
    setSelectedTabIdx(0)
  }, [rFormType, tabsRef])

  return { selectedTabIdx, tabPositions, setSelectedTabIdx }
}
