import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SlideTab, SlideTabs } from '../TabSlide'
import styled from 'styled-components'
import TabSlide from '../TabSlide/SlideTabsWrapper'

export const StyledTabSlide = styled(TabSlide)`
  margin-bottom: var(--spacing-2);
`

export interface Tab<T> {
  label: string
  value: T
}

interface TabSliderProps<T> {
  tabs: Tab<T>[]
  activeTab: T
  onTabChange: (tab: T) => void
  isTabVisible?: (tab: Tab<T>) => boolean
}

const TabSlider = <T,>({ tabs, activeTab, onTabChange, isTabVisible = () => true }: TabSliderProps<T>) => {
  const tabsRef = useRef<HTMLDivElement>(null)
  const [tabPositions, setTabPositions] = useState<{ left: number; width: number; top: number }[]>([])
  const [selectedTabIdx, setSelectedTabIdx] = useState(0)

  // tabs positions
  useEffect(() => {
    if (!tabsRef.current) return

    const tabsNode = tabsRef.current
    const tabsDOMRect = tabsNode.getBoundingClientRect()
    const updatedTabPositions = Array.from(tabsNode.childNodes as NodeListOf<HTMLInputElement>)
      .filter((n) => n.classList.contains('tab'))
      .map((n, idx) => {
        const domRect = n.getBoundingClientRect()
        const left = idx === 0 ? 0 : domRect.left - tabsDOMRect.left
        const top = domRect.bottom - tabsDOMRect.top
        return { left, width: domRect.width, top }
      })

    setTabPositions(updatedTabPositions)
  }, [selectedTabIdx])

  const handleTabChange = useCallback(
    (idx: number) => {
      onTabChange(tabs[idx].value)
      setSelectedTabIdx(idx)
    },
    [onTabChange, tabs],
  )

  useEffect(() => {
    const newIdx = tabs.findIndex((tab) => tab.value === activeTab)
    if (newIdx !== -1) {
      setSelectedTabIdx(newIdx)
    }
  }, [activeTab, tabs])

  return (
    <StyledTabSlide activeIdx={selectedTabIdx}>
      <SlideTabs ref={tabsRef}>
        {tabs.map((tab, idx) => {
          if (!isTabVisible(tab)) {
            return <React.Fragment key={tab.label}></React.Fragment>
          }

          return (
            <SlideTab
              key={tab.label}
              tabLeft={tabPositions[idx]?.left}
              tabWidth={tabPositions[idx]?.width}
              tabTop={tabPositions[idx]?.top}
              onChange={() => handleTabChange(idx)}
              tabIdx={idx}
              label={tab.label}
            />
          )
        })}
      </SlideTabs>
    </StyledTabSlide>
  )
}

export default TabSlider
