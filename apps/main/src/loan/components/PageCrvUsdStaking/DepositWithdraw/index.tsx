import { type ComponentType, useEffect } from 'react'
import { styled } from 'styled-components'
import useStore from '@/loan/store/useStore'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { DEX_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'
import { TransactionDetails } from '../components/TransactionDetails'
import TransactionTracking from '../TransactionTracking'
import type { DepositWithdrawModule } from '../types'
import DeployButton from './DeployButton'
import DepositModule from './DepositModule'
import WithdrawModule from './WithdrawModule'

const { MaxWidth } = SizesAndSpaces

type DepositWithdrawProps = {
  params: NetworkUrlParams
}

const ScrvUsdFormTab = ({ mode, Module }: { mode: DepositWithdrawModule; Module: ComponentType }) => {
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
  const { llamaApi: curve = null } = useCurve()

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
    // sync the staking module with the tab mode
    setStakingModule(mode)
  }, [mode, setStakingModule])

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

  return (
    <Wrapper>
      <ModuleContainer>
        <Module />
        {transactionInProgress || transactionSuccess ? <StyledTransactionTracking /> : <StyledDeployButton />}
      </ModuleContainer>
      <TransactionDetailsWrapper>
        <TransactionDetails />
      </TransactionDetailsWrapper>
    </Wrapper>
  )
}

const DepositTab = () => <ScrvUsdFormTab mode="deposit" Module={DepositModule} />
const WithdrawTab = () => <ScrvUsdFormTab mode="withdraw" Module={WithdrawModule} />

const menu = [
  { value: 'deposit', label: t`Deposit`, component: DepositTab },
  { value: 'withdraw', label: t`Withdraw`, component: WithdrawTab },
  {
    value: 'swap',
    label: t`Swap`,
    href: ({ network }) => `${getInternalUrl('dex', network, DEX_ROUTES.PAGE_SWAP)}?to=${CRVUSD_ADDRESS}`,
  },
] satisfies FormTab<NetworkUrlParams>[]

export const DepositWithdraw = ({ params }: DepositWithdrawProps) => <FormTabs params={params} menu={menu} />

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: ${MaxWidth.legacyActionCard};
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
