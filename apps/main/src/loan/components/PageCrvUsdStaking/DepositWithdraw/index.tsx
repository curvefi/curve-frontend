import { type ComponentType, useEffect } from 'react'
import useStore from '@/loan/store/useStore'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { DEX_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { FormContent } from '@ui-kit/widgets/DetailPageLayout/FormContent'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'
import { TransactionDetails } from '../components/TransactionDetails'
import TransactionTracking from '../TransactionTracking'
import type { DepositWithdrawModule } from '../types'
import DeployButton from './DeployButton'
import DepositModule from './DepositModule'
import WithdrawModule from './WithdrawModule'

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
    // sync the staking module with the tab mode, needed until we get rid of the store
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
    <FormContent footer={<TransactionDetails />}>
      <Module />
      {transactionInProgress || transactionSuccess ? <TransactionTracking /> : <DeployButton />}
    </FormContent>
  )
}

const menu = [
  {
    value: 'deposit',
    label: t`Deposit`,
    component: () => <ScrvUsdFormTab mode="deposit" Module={DepositModule} />,
  },
  {
    value: 'withdraw',
    label: t`Withdraw`,
    component: () => <ScrvUsdFormTab mode="withdraw" Module={WithdrawModule} />,
  },
  {
    value: 'swap',
    label: t`Swap`,
    href: ({ network }) => `${getInternalUrl('dex', network, DEX_ROUTES.PAGE_SWAP)}?to=${CRVUSD_ADDRESS}`,
  },
] satisfies FormTab<NetworkUrlParams>[]

export const DepositWithdraw = ({ params }: DepositWithdrawProps) => <FormTabs params={params} menu={menu} />
