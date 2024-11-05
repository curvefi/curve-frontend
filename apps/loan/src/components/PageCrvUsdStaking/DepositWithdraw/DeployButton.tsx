import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { useSignerAddress } from '@/entities/signer'

import Button from '@/ui/Button'
import React from 'react'

type DeployButtonProps = {
  className?: string
}

const DeployButton: React.FC<DeployButtonProps> = ({ className }) => {
  const { data: signerAddress } = useSignerAddress()
  const { approval: depositApproved, fetchStatus: depositFetchStatus } = useStore(
    (state) => state.scrvusd.depositApproval,
  )
  const { depositApprove } = useStore((state) => state.scrvusd.deploy)
  const { inputAmount, stakingModule, userBalances } = useStore((state) => state.scrvusd)

  const userBalance = userBalances[signerAddress?.toLowerCase() ?? ''] ?? { crvUSD: 0, scrvUSD: 0 }

  const getButtonTitle = () => {
    if (stakingModule === 'deposit' && depositApproved) {
      return t`Deposit`
    }
    if (stakingModule === 'deposit' && !depositApproved) {
      return t`Approve`
    }
    if (stakingModule === 'withdraw' && depositApproved) {
      return t`Withdraw`
    }
    if (stakingModule === 'withdraw' && !depositApproved) {
      return t`Approve`
    }
  }

  const buttonTitle = getButtonTitle()
  const approvalLoading = depositFetchStatus === 'loading'
  const isError =
    stakingModule === 'deposit'
      ? depositApproved && inputAmount > +userBalance.crvUSD
      : depositApproved && inputAmount > +userBalance.scrvUSD

  const handleClick = () => {
    if (stakingModule === 'deposit') {
      if (!depositApproved) {
        depositApprove(inputAmount)
      }
    }
  }

  return (
    <Button
      variant="filled"
      loading={approvalLoading}
      className={className}
      disabled={isError || inputAmount === 0}
      onClick={handleClick}
    >
      {buttonTitle}
    </Button>
  )
}

export default DeployButton
