import React from 'react'

import { formatNumber } from '@/ui/utils'
import { useClaimContext } from '@/components/PagePool/Claim/contextClaim'

import Stats from '@/ui/Stats'

const DetailsClaimableRewards: React.FC = () => {
  const { claimableRewards } = useClaimContext()

  return (
    <>
      {claimableRewards.map(({ token, symbol, amount }, idx) => {
        const showBottomBorder = idx !== claimableRewards.length - 1
        return (
          <Stats isOneLine isBorderBottom={showBottomBorder} key={token} label={symbol}>
            {formatNumber(amount)}
          </Stats>
        )
      })}
    </>
  )
}

export default DetailsClaimableRewards
