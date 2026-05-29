import { createContext, type Dispatch, type ReactNode, type SetStateAction, use } from 'react'
import type { BoxProps } from '../Box/types'
import type { InputMinHeight, InputVariant } from './types'

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

// eslint-disable-next-line @eslint-react/no-use-context -- Existing violation before enabling this rule.
export const useInputContext = () => use(InputContext)
