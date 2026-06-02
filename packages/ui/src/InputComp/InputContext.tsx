import { createContext, type Dispatch, type ReactNode, type SetStateAction, use } from 'react'
import type { BoxProps } from '../Box/types'
import type { InputMinHeight, InputVariant } from './types'

export type InputProviderProps = {
  children: ReactNode
  disabled?: boolean
  id: string
  inputVariant?: InputVariant | ''
  minHeight?: InputMinHeight
  padding?: string
} & Omit<BoxProps, 'padding'>

type InputContextProps = {
  setIsFocusVisible: Dispatch<SetStateAction<boolean>>
} & Pick<InputProviderProps, 'disabled' | 'id' | 'inputVariant'>

export const InputContext = createContext<InputContextProps>(undefined!)

export const useInputContext = () => use(InputContext)
