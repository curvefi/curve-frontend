import { useEffect } from 'react'
import styled from 'styled-components'
import useStore from '@/loan/store/useStore'
import type { LlamaApi } from '@/loan/types/loan.types'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import SubNav from '../components/SubNav'
import type { SubNavItem } from '../components/SubNav/types'
import { TransactionDetails } from '../components/TransactionDetails'
import TransactionTracking from '../TransactionTracking'
import type { DepositWithdrawModule } from '../types'
import { SUB_NAV_ITEMS } from './constants'
import DeployButton from './DeployButton'
import DepositModule from './DepositModule'
import WithdrawModule from './WithdrawModule'

const { MaxWidth } = SizesAndSpaces

type DepositWithdrawProps = {
  className?: string
}

const DepositWithdraw = ({ className }: DepositWithdrawProps) => {
  const stakingModule = useStore((state) => state.scrvusd.stakingModule)
  const setStakingModule = useStore((state) => state.scrvusd.setStakingModule)
  const previewAction = useStore((state) => state.scrvusd.previewAction)
  const inputAmount = useStore((state) => state.scrvusd.inputAmount)
  const setPreviewReset = useStore((state) => state.scrvusd.setPreviewReset)
  const approveDepositTransaction = useStore((state) => state.scrvusd.approveDepositTransaction)
  const depositTransaction = useStore((state) => state.scrvusd.depositTransaction)
  const depositApproval = useStore((state) => state.scrvusd.depositApproval)
  const getInputAmountApproved = useStore((state) => state.scrvusd.getInputAmountApproved)
  const withdrawTransaction = useStore((state) => state.scrvusd.withdrawTransaction)
  const estimateGasDepositApprove = useStore((state) => state.scrvusd.estimateGas.depositApprove)
  const estimateGasDeposit = useStore((state) => state.scrvusd.estimateGas.deposit)
  const estimateGasWithdraw = useStore((state) => state.scrvusd.estimateGas.withdraw)
  const { lib: lending = null } = useConnection<LlamaApi>()
  const { lib: curve = null } = useConnection<LlamaApi>()

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
      if (lending && curve && inputAmount !== '0') {
        if (stakingModule === 'deposit') {
          if (isDepositApprovalReady) {
            void estimateGasDeposit(inputAmount)
          } else {
            void estimateGasDepositApprove(inputAmount)
          }
          previewAction('deposit', inputAmount)
        } else {
          void estimateGasWithdraw(inputAmount)
          previewAction('withdraw', inputAmount)
        }
      }

      if (inputAmount === '0') {
        setPreviewReset()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [
    lending,
    estimateGasDepositApprove,
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
