import type { ClaimableDetailsResp } from '@/entities/withdraw'

import React from 'react'

import { getClaimText } from '@/components/PagePool/Withdraw/utils'

import Button from '@/ui/Button'

type Props = {
  claimableCrv: string
  claimableRewards: ClaimableDetailsResp['claimableRewards']
  isDisabled: boolean
  isPending: boolean
  isSuccess: boolean
  rewardsNeedNudgingAndHaveGauge: boolean | undefined
  handleClaimClick: () => void
}

const BtnClaimCrv: React.FC<Props> = ({
  claimableCrv,
  claimableRewards,
  isDisabled,
  isPending,
  isSuccess,
  rewardsNeedNudgingAndHaveGauge,
  handleClaimClick,
}) => {
  const haveClaimableCrvBtn = Number(claimableCrv) > 0 || !!rewardsNeedNudgingAndHaveGauge

  return (
    <Button
      disabled={!haveClaimableCrvBtn || isDisabled || isSuccess}
      loading={isPending}
      variant="filled"
      size="large"
      onClick={handleClaimClick}
    >
      {isSuccess
        ? 'Claimed'
        : getClaimText(claimableCrv, claimableRewards, 'CLAIM_CRV', 'claimCrvButton', rewardsNeedNudgingAndHaveGauge)}
    </Button>
  )
}

export default BtnClaimCrv
