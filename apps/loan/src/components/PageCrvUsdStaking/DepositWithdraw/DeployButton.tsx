import { t } from '@lingui/macro'
import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'

import useStore from '@/store/useStore'

import Button from '@/ui/Button'
import React from 'react'

type DeployButtonProps = {
  className?: string
}

const DeployButton: React.FC<DeployButtonProps> = ({ className }) => {
  const onboardInstance = useStore((state) => state.wallet.onboard)
  const signerAddress = onboardInstance?.state.get().wallets?.[0]?.accounts?.[0]?.address
  const { approval: depositApproved, fetchStatus: depositFetchStatus } = useStore(
    (state) => state.scrvusd.depositApproval,
  )
  const { depositApprove, deposit, withdraw, redeem } = useStore((state) => state.scrvusd.deploy)
  const { inputAmount, stakingModule, userBalances, getInputAmountApproved } = useStore((state) => state.scrvusd)

  const userBalance = useMemo(
    () => userBalances[signerAddress?.toLowerCase() ?? ''] ?? { crvUSD: '0', scrvUSD: '0' },
    [userBalances, signerAddress],
  )

  const isInputAmountApproved = getInputAmountApproved()

  const buttonTitle = useMemo(() => {
    if (
      (stakingModule === 'deposit' && isInputAmountApproved) ||
      (stakingModule === 'deposit' && inputAmount === '0')
    ) {
      return t`Deposit`
    }
    if (stakingModule === 'deposit' && !depositApproved) {
      return t`Approve & Deposit`
    }
    if (stakingModule === 'withdraw') {
      return t`Withdraw`
    }
  }, [stakingModule, isInputAmountApproved, inputAmount, depositApproved])

  const approvalLoading = depositFetchStatus === 'loading'
  const isError =
    stakingModule === 'deposit'
      ? BigNumber(inputAmount).gt(BigNumber(userBalance.crvUSD))
      : BigNumber(inputAmount).gt(BigNumber(userBalance.scrvUSD))

  const handleClick = useCallback(async () => {
    if (stakingModule === 'deposit') {
      if (isInputAmountApproved) {
        deposit(inputAmount)
      }
      if (!isInputAmountApproved) {
        const approved = await depositApprove(inputAmount)
        if (approved) {
          deposit(inputAmount)
        }
      }
    }

    if (stakingModule === 'withdraw') {
      if (inputAmount === userBalance.scrvUSD) {
        redeem(inputAmount)
      } else {
        redeem(inputAmount)
      }
    }
  }, [stakingModule, isInputAmountApproved, deposit, inputAmount, depositApprove, redeem, userBalance])

  return (
    <StyledButton
      variant="filled"
      loading={approvalLoading}
      className={className}
      disabled={isError || inputAmount === '0'}
      onClick={handleClick}
    >
      {buttonTitle}
    </StyledButton>
  )
}

const StyledButton = styled(Button)`
  height: 2.5rem;
`

export default DeployButton
