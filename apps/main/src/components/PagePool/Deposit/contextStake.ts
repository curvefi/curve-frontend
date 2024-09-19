import type { StakeFormValues } from '@/entities/deposit'

import { createContext, useContext } from 'react'

type StakeContextType = {
  formValues: StakeFormValues
  isDisabled: boolean
  isLoading: boolean
  updateFormValues: (formValues: Partial<StakeFormValues>) => void
}

export const StakeContext = createContext<StakeContextType | null>(null)

export const useStakeContext = () => {
  const stakeContext = useContext(StakeContext)

  if (!stakeContext) {
    throw new Error('useStake has to be used within <StakeContext.Provider>')
  }

  return stakeContext
}
