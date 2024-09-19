import React from 'react'

import { formatNumber } from '@/ui/utils'
import { useClaimContext } from '@/components/PagePool/Claim/contextClaim'

import Stats from '@/ui/Stats'

export const DetailsClaimableCrv = () => {
  const { claimableCrv, haveClaimableCrv, haveClaimableRewards } = useClaimContext()

  return (
    <>
      {haveClaimableCrv && (
        <Stats isOneLine isBorderBottom={haveClaimableRewards} label="CRV">
          {formatNumber(claimableCrv)}
        </Stats>
      )}
    </>
  )
}

export default DetailsClaimableCrv
