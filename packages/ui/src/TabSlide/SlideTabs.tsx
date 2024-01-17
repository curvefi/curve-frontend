import * as React from 'react'
import { useContext } from 'react'
import styled from 'styled-components'

import { Context, Slider } from './SlideTabsWrapper'

const SlideTabs = React.forwardRef<HTMLDivElement, React.PropsWithChildren<{}>>(({ children }, ref) => {
  const { className = '', sliderPosition } = useContext(Context)
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
