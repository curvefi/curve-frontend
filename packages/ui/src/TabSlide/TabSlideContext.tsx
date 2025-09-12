import { Dispatch, SetStateAction } from 'react'
import { createContext } from 'react'

export type Position = { width: number; top: number }

export type TabSlideProps = {
  className?: string
  activeIdx: number
  disabled?: boolean
}

interface ContextProps extends TabSlideProps {
  sliderPosition: Position
  setSliderPosition: Dispatch<SetStateAction<Position>>
}

export const TabSlideContext = createContext<ContextProps>(undefined!)
