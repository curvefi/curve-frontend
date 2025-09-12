import { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext } from 'react'
import type { BoxProps } from '@/Box/types'
import type { InputMinHeight, InputVariant } from '@/InputComp/types'

export interface InputProviderProps extends Omit<BoxProps, 'padding'> {
  children: ReactNode
  disabled?: boolean
  id: string
  inputVariant?: InputVariant | ''
  minHeight?: InputMinHeight
  padding?: string
}

interface InputContextProps extends Pick<InputProviderProps, 'disabled' | 'id' | 'inputVariant'> {
  setIsFocusVisible: Dispatch<SetStateAction<boolean>>
}

export const InputContext = createContext<InputContextProps>(undefined!)

export const useInputContext = () => useContext(InputContext)
