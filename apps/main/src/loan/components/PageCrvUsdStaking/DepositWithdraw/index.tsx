import { useEffect } from 'react'
import { styled } from 'styled-components'
import useStore from '@/loan/store/useStore'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { DEX_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { TransactionDetails } from '../components/TransactionDetails'
import TransactionTracking from '../TransactionTracking'
import DeployButton from './DeployButton'
import DepositModule from './DepositModule'
import WithdrawModule from './WithdrawModule'

const { MaxWidth } = SizesAndSpaces

type DepositWithdrawProps = {
  className?: string
}

type Tab = 'deposit' | 'withdraw' | 'swap'
const tabs: TabOption<Tab>[] = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdraw', label: 'Withdraw' },
  { value: 'swap', label: 'Swap' },
]

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
  const { llamaApi: curve = null } = useConnection()

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
      if (curve && inputAmount !== '0') {
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

  const handleSelectTab = (tab: Tab) => {
    // Swapping opens a new browser tab for now, temp solution until it can be replaced with an actual tab and an Enzo zap in the future.
    if (tab === 'swap') {
      window.open(`${getInternalUrl('dex', 'ethereum', DEX_ROUTES.PAGE_SWAP)}?to=${CRVUSD_ADDRESS}`, '_blank')
    } else {
      setStakingModule(tab)
    }
  }

  return (
    <Wrapper className={className}>
      <TabsSwitcher variant="contained" size="medium" value={stakingModule} onChange={handleSelectTab} options={tabs} />

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
