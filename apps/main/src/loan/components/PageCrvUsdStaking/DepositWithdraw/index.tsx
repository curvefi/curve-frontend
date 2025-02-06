import { SubNavItem } from '@/loan/components/PageCrvUsdStaking/components/SubNav/types'
import { DepositWithdrawModule } from '@/loan/components/PageCrvUsdStaking/types'
import { useEffect } from 'react'
import styled from 'styled-components'

import useStore from '@/loan/store/useStore'
import { SUB_NAV_ITEMS } from '@/loan/components/PageCrvUsdStaking/DepositWithdraw/constants'

import SubNav from '@/loan/components/PageCrvUsdStaking/components/SubNav'
import TransactionDetails from '@/loan/components/PageCrvUsdStaking/TransactionDetails'
import DepositModule from '@/loan/components/PageCrvUsdStaking/DepositWithdraw/DepositModule'
import WithdrawModule from '@/loan/components/PageCrvUsdStaking/DepositWithdraw/WithdrawModule'
import DeployButton from '@/loan/components/PageCrvUsdStaking/DepositWithdraw/DeployButton'
import TransactionTracking from '@/loan/components/PageCrvUsdStaking/TransactionTracking'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxWidth } = SizesAndSpaces

type DepositWithdrawProps = {
  className?: string
}

const DepositWithdraw = ({ className }: DepositWithdrawProps) => {
  const {
    stakingModule,
    setStakingModule,
    previewAction,
    inputAmount,
    setPreviewReset,
    approveDepositTransaction,
    depositTransaction,
    depositApproval,
    getInputAmountApproved,
    withdrawTransaction,
  } = useStore((state) => state.scrvusd)
  const {
    depositApprove: estimateGasDepositApprove,
    deposit: estimateGasDeposit,
    withdraw: estimateGasWithdraw,
  } = useStore((state) => state.scrvusd.estimateGas)
  const { lendApi, curve, curve: chainId } = useStore((state) => state)

  const setNavChange = (key: SubNavItem['key']) => {
    setStakingModule(key as DepositWithdrawModule)
  }

  const transactionInProgress =
    (stakingModule === 'deposit' &&
      approveDepositTransaction.transactionStatus !== '' &&
      approveDepositTransaction.transactionStatus !== 'error') ||
    (stakingModule === 'deposit' &&
      depositTransaction.transactionStatus !== '' &&
      depositTransaction.transactionStatus !== 'error') ||
    (stakingModule === 'withdraw' &&
      withdrawTransaction.transactionStatus !== '' &&
      withdrawTransaction.transactionStatus !== 'error')
  const transactionSuccess =
    (stakingModule === 'deposit' && depositTransaction.transactionStatus === 'success') ||
    (stakingModule === 'withdraw' && withdrawTransaction.transactionStatus === 'success')

  const isDepositApprovalReady = getInputAmountApproved()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (lendApi && curve && inputAmount !== '0') {
        if (stakingModule === 'deposit') {
          if (isDepositApprovalReady) {
            estimateGasDeposit(inputAmount)
          } else {
            estimateGasDepositApprove(inputAmount)
          }
          previewAction('deposit', inputAmount)
        } else {
          estimateGasWithdraw(inputAmount)
          previewAction('withdraw', inputAmount)
        }
      }

      if (inputAmount === '0') {
        setPreviewReset()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [
    lendApi,
    estimateGasDepositApprove,
    chainId,
    curve,
    inputAmount,
    stakingModule,
    previewAction,
    setPreviewReset,
    estimateGasDeposit,
    depositApproval.approval,
    estimateGasWithdraw,
    isDepositApprovalReady,
  ])

  return (
    <Wrapper className={className}>
      <SubNav activeKey={stakingModule} navItems={SUB_NAV_ITEMS} setNavChange={setNavChange} />
      <ModuleContainer>
        {stakingModule === 'deposit' ? <DepositModule /> : <WithdrawModule />}
        {transactionInProgress || transactionSuccess ? <StyledTransactionTracking /> : <StyledDeployButton />}
      </ModuleContainer>
      <TransactionDetailsWrapper>
        <TransactionDetails />
      </TransactionDetailsWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: ${MaxWidth.actionCard};
  width: 100%;
  /* @media (min-width: ) {
    padding: 0 var(--spacing-3);
  } */
`

const ModuleContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--tab--content--background-color);
  min-width: 100%;
  padding: var(--spacing-3);
`

const TransactionDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 100%;
  padding: var(--spacing-3);
  background-color: var(--page--background-color);
`

const StyledDeployButton = styled(DeployButton)`
  margin: var(--spacing-3) 0 0;
`

const StyledTransactionTracking = styled(TransactionTracking)`
  margin-top: var(--spacing-3);
`

export default DepositWithdraw
