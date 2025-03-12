import BigNumber from 'bignumber.js'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusdUserBalances'
import useStore from '@/loan/store/useStore'
import Button from '@ui/Button'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

type DeployButtonProps = { className?: string }

const DeployButton = ({ className }: DeployButtonProps) => {
  const { signerAddress } = useWallet()
  const { data: userScrvUsdBalance } = useScrvUsdUserBalances({ userAddress: signerAddress ?? '' })
  const depositApproved = useStore((state) => state.scrvusd.depositApproval.approval)
  const depositFetchStatus = useStore((state) => state.scrvusd.depositApproval.fetchStatus)
  const { depositApprove, deposit, redeem } = useStore((state) => state.scrvusd.deploy)
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
