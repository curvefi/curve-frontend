import { RefObject, useEffect, useState } from 'react'

/**
 * Custom hook to manage the state of sliding tabs.
 * It calculates the position and dimensions of each tab within a container (`tabsRef`)
 * and keeps track of the currently selected tab index.
 * The hook recalculates positions when the `rFormType` or `tabsRef` changes.
 *
 * @param tabsRef - A React ref object pointing to the container element holding the tabs.
 * @param rFormType - A dependency value that triggers recalculation when changed (e.g., form type).
 * @returns An object containing the selected tab index (`selectedTabIdx`),
 *          an array of tab positions (`tabPositions`), and a function to update the selected index (`setSelectedTabIdx`).
 */
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
