import * as React from 'react'

import { createContext, useState } from 'react'
import styled from 'styled-components'

export type Position = { width: number; top: number }

interface ContextProps extends TabSlideProps {
  sliderPosition: Position
  setSliderPosition: React.Dispatch<React.SetStateAction<Position>>
}

export const Context = createContext<ContextProps>(undefined!)

type TabSlideProps = {
  className?: string
  activeIdx: number
  disabled?: boolean
}

const SlideTabsWrapper = ({ className, activeIdx, disabled, children }: React.PropsWithChildren<TabSlideProps>) => {
  const [sliderPosition, setSliderPosition] = useState<Position>({ width: 0, top: 0 })

  const value = { activeIdx, className, disabled, sliderPosition, setSliderPosition }
  return <Context.Provider value={value}>{children}</Context.Provider>
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
