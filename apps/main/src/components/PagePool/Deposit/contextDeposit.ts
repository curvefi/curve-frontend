import type { DepositFormValues } from '@/entities/deposit'

import { createContext, useContext } from 'react'

type DepositContextType = {
  formValues: DepositFormValues
  isDisabled: boolean
  isLoading: boolean
  updateFormValues: (formValues: Partial<DepositFormValues>) => void
}

export const DepositContext = createContext<DepositContextType | null>(null)
export const DepositContextProvider = DepositContext.Provider

export const useDepositContext = () => {
  const depositContext = useContext(DepositContext)

  if (!depositContext) {
    throw new Error('useDeposit has to be used within <DepositContext.Provider>')
  }

  return depositContext
}
