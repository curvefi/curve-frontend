import { t } from '@lingui/macro'
import { useCallback } from 'react'

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
  const { depositApprove, deposit } = useStore((state) => state.scrvusd.deploy)
  const { inputAmount, stakingModule, userBalances, getInputAmountApproved } = useStore((state) => state.scrvusd)

  const userBalance = userBalances[signerAddress?.toLowerCase() ?? ''] ?? { crvUSD: 0, scrvUSD: 0 }
  const inputAmountApproved = getInputAmountApproved()

  const getButtonTitle = () => {
    if ((stakingModule === 'deposit' && inputAmountApproved) || inputAmount === 0) {
      return t`Deposit`
    }
    if (stakingModule === 'deposit' && !depositApproved) {
      return t`Approve & Deposit`
    }
    if (stakingModule === 'withdraw') {
      return t`Withdraw`
    }
  }

  const buttonTitle = getButtonTitle()
  const approvalLoading = depositFetchStatus === 'loading'
  const isError =
    stakingModule === 'deposit'
      ? depositApproved && inputAmount > +userBalance.crvUSD
      : inputAmount > +userBalance.scrvUSD

  const handleClick = useCallback(async () => {
    if (stakingModule === 'deposit') {
      if (inputAmountApproved) {
        deposit(inputAmount)
      }
      if (!inputAmountApproved) {
        const approved = await depositApprove(inputAmount)
        if (approved) {
          deposit(inputAmount)
        }
      }
    }
  }, [stakingModule, inputAmountApproved, deposit, inputAmount, depositApprove])

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
