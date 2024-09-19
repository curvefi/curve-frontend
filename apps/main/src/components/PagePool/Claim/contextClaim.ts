import type { ClaimType, ClaimableDetailsResp } from '@/entities/withdraw'

import React, { createContext, useContext } from 'react'

type ClaimContextType = Pick<ClaimableDetailsResp, 'claimableCrv' | 'claimableRewards'> & {
  claimType: ClaimType
  haveClaimableCrv: boolean
  haveClaimableRewards: boolean
  haveClaimables: boolean
  isDisabled: boolean
  isLoading: boolean
  setClaimType: React.Dispatch<React.SetStateAction<ClaimType>>
}

export const ClaimContext = createContext<ClaimContextType | null>(null)

export const useClaimContext = () => {
  const claimContext = useContext(ClaimContext)

  if (!claimContext) {
    throw new Error('useFormWithdraw has to be used within <ClaimContext.Provider>')
  }

  return claimContext
}
