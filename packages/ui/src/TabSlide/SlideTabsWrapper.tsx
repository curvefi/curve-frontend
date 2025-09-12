import { ReactNode, useState } from 'react'
import { styled } from 'styled-components'
import { TabSlideContext, TabSlideProps, Position } from './TabSlideContext'

type SlideTabsWrapperProps = TabSlideProps & { children: ReactNode }

const SlideTabsWrapper = ({ className, activeIdx, disabled, children }: SlideTabsWrapperProps) => {
  const [sliderPosition, setSliderPosition] = useState<Position>({ width: 0, top: 0 })

  const value = { activeIdx, className, disabled, sliderPosition, setSliderPosition }
  return <TabSlideContext value={value}>{children}</TabSlideContext>
}

export const Slider = styled.div`
  position: absolute;
  height: 2px;
  background: var(--tab--color);
  transition: left 0.25s ease;

  &.disabled {
    opacity: 0.7;
  }
`

export default SlideTabsWrapper
