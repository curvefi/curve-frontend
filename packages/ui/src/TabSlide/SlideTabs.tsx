import { forwardRef, ReactNode, useContext } from 'react'
import { styled } from 'styled-components'
import { Slider } from './SlideTabsWrapper'
import { TabSlideContext } from './TabSlideContext'

const SlideTabs = forwardRef<HTMLDivElement, { children: ReactNode }>(({ children }, ref) => {
  const { className = '', sliderPosition } = useContext(TabSlideContext)
  return (
    <TabsWrapper className={className} ref={ref}>
      {children}
      <Slider className="tab-slider" style={{ width: sliderPosition.width, top: sliderPosition.top }} />
    </TabsWrapper>
  )
})

const TabsWrapper = styled.div`
  position: relative;
`

SlideTabs.displayName = 'TabSlideTabs'

export default SlideTabs
