import type { UnstakeFormValues } from '@/entities/withdraw'

import { createContext, useContext } from 'react'

type UnstakeContextType = {
  formValues: UnstakeFormValues
  isDisabled: boolean
  isLoading: boolean
  updateFormValues: (formValues: Partial<UnstakeFormValues>) => void
}

export const UnstakeContext = createContext<UnstakeContextType | null>(null)
export const UnstakeContextProvider = UnstakeContext.Provider

export const useUnstakeContext = () => {
  const unstakeContext = useContext(UnstakeContext)

  if (!unstakeContext) {
    throw new Error('useFormUnstake has to be used within <UnstakeContext.Provider>')
  }

  return unstakeContext
}
