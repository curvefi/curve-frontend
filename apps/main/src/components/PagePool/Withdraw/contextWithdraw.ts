import type { WithdrawFormValues } from '@/entities/withdraw'

import { createContext, useContext } from 'react'

type WithdrawContextType = {
  formValues: WithdrawFormValues
  isDisabled: boolean
  isLoading: boolean
  updateFormValues: (formValues: Partial<WithdrawFormValues>) => void
}

export const FormWithdrawContext = createContext<WithdrawContextType | null>(null)

export const useWithdrawContext = () => {
  const withdrawContext = useContext(FormWithdrawContext)

  if (!withdrawContext) {
    throw new Error('useFormWithdraw has to be used within <FormWithdrawContext.Provider>')
  }

  return withdrawContext
}
