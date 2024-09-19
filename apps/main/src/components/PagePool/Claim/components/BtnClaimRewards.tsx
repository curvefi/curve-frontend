import type { ClaimableDetailsResp } from '@/entities/withdraw'

import React from 'react'
import { t } from '@lingui/macro'

import Button from '@/ui/Button'

type Props = {
  claimableRewards: ClaimableDetailsResp['claimableRewards']
  isDisabled: boolean
  isPending: boolean
  isSuccess: boolean
  handleClaimClick: () => void
}

const BtnClaimRewards: React.FC<Props> = ({ claimableRewards, isDisabled, isPending, isSuccess, handleClaimClick }) => {
  const haveClaimableRewardsBtn = claimableRewards.length > 0 || isSuccess

  return (
    <Button
      disabled={!haveClaimableRewardsBtn || isDisabled || isSuccess}
      loading={isPending}
      variant="filled"
      size="large"
      onClick={handleClaimClick}
    >
      {isSuccess ? 'Claimed' : t`Claim Rewards`}
    </Button>
  )
}

export default BtnClaimRewards
