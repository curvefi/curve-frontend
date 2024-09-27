import type { SwapFormValues } from '@/entities/swap'

import { createContext, useContext } from 'react'

type SwapContextType = {
  formValues: SwapFormValues
  isDisabled: boolean
  isLoading: boolean
  updateFormValues: (formValues: Partial<SwapFormValues>) => void
}

export const SwapContext = createContext<SwapContextType | null>(null)
export const SwapContextProvider = SwapContext.Provider

export const useSwapContext = () => {
  const swapContext = useContext(SwapContext)

  if (!swapContext) {
    throw new Error('useSwap has to be used within <SwapContext.Provider>')
  }

  return swapContext
}
