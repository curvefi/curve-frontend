import BigNumber from 'bignumber.js'
import { useCallback, useMemo } from 'react'
import { styled } from 'styled-components'
import { useConnection } from 'wagmi'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances'
import { useStore } from '@/loan/store/useStore'
import { Button } from '@ui/Button'
import { t } from '@ui-kit/lib/i18n'

type DeployButtonProps = { className?: string }

export const DeployButton = ({ className }: DeployButtonProps) => {
  const { address } = useConnection()
  const { data: userScrvUsdBalance } = useScrvUsdUserBalances({ userAddress: address })
  const depositApproved = useStore((state) => state.scrvusd.depositApproval.approval)
  const depositFetchStatus = useStore((state) => state.scrvusd.depositApproval.fetchStatus)
  const depositApprove = useStore((state) => state.scrvusd.deploy.depositApprove)
  const deposit = useStore((state) => state.scrvusd.deploy.deposit)
  const redeem = useStore((state) => state.scrvusd.deploy.redeem)
  const inputAmount = useStore((state) => state.scrvusd.inputAmount)
  const stakingModule = useStore((state) => state.scrvusd.stakingModule)
  const getInputAmountApproved = useStore((state) => state.scrvusd.getInputAmountApproved)

  const userBalance = useMemo(() => userScrvUsdBalance ?? { crvUSD: '0', scrvUSD: '0' }, [userScrvUsdBalance])

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
        void deposit(inputAmount)
      }
      if (!isInputAmountApproved) {
        const approved = await depositApprove(inputAmount)
        if (approved) {
          void deposit(inputAmount)
        }
      }
    }

    if (stakingModule === 'withdraw') {
      if (inputAmount === userBalance.scrvUSD) {
        void redeem(inputAmount)
      } else {
        void redeem(inputAmount)
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
