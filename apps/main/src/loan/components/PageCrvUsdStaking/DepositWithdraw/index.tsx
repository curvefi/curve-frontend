import { useCallback, useEffect } from 'react'
import { useConnection } from 'wagmi'
import LoanFormConnect from '@/loan/components/LoanFormConnect'
import { SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import useStore from '@/loan/store/useStore'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useDebounced } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'
import { DEX_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { FormContent } from '@ui-kit/widgets/DetailPageLayout/FormContent'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'
import { TransactionDetails } from '../components/TransactionDetails'
import TransactionTracking from '../TransactionTracking'
import DeployButton from './DeployButton'
import DepositModule from './DepositModule'
import WithdrawModule from './WithdrawModule'

type DepositWithdrawProps = {
  params: NetworkUrlParams
}

const ScrvUsdDepositFormTab = () => {
  const setStakingModule = useStore((state) => state.scrvusd.setStakingModule)
  const previewAction = useStore((state) => state.scrvusd.previewAction)
  const inputAmount = useStore((state) => state.scrvusd.inputAmount)
  const setPreviewReset = useStore((state) => state.scrvusd.setPreviewReset)
  const approveDepositTransaction = useStore((state) => state.scrvusd.approveDepositTransaction)
  const depositTransaction = useStore((state) => state.scrvusd.depositTransaction)
  const depositApproval = useStore((state) => state.scrvusd.depositApproval)
  const getInputAmountApproved = useStore((state) => state.scrvusd.getInputAmountApproved)
  const estimateGasDepositApprove = useStore((state) => state.scrvusd.estimateGas.depositApprove)
  const estimateGasDeposit = useStore((state) => state.scrvusd.estimateGas.deposit)
  const { llamaApi: curve = null } = useCurve()
  const { address } = useConnection()

  const transactionInProgress =
    (approveDepositTransaction.transactionStatus !== '' && approveDepositTransaction.transactionStatus !== 'error') ||
    (depositTransaction.transactionStatus !== '' && depositTransaction.transactionStatus !== 'error')
  const transactionSuccess = depositTransaction.transactionStatus === 'success'
  const isDepositApprovalReady = getInputAmountApproved()

  useEffect(() => {
    setStakingModule('deposit') // sync the staking module with the tab mode, needed until we get rid of the store
  }, [setStakingModule])

  const [debouncedPreview] = useDebounced(
    useCallback(
      (currentInputAmount: string, isApprovalReady: boolean, hasCurve: boolean) => {
        if (currentInputAmount === '0') return setPreviewReset()
        if (hasCurve) {
          if (isApprovalReady) {
            void estimateGasDeposit(currentInputAmount)
          } else {
            void estimateGasDepositApprove(currentInputAmount)
          }
          previewAction('deposit', currentInputAmount)
        }
      },
      [estimateGasDeposit, estimateGasDepositApprove, previewAction, setPreviewReset],
    ),
    Duration.FormDebounce,
  )

  useEffect(() => {
    debouncedPreview(inputAmount, isDepositApprovalReady, !!curve)
  }, [curve, debouncedPreview, depositApproval.approval, inputAmount, isDepositApprovalReady])

  return (
    <FormContent footer={<TransactionDetails />}>
      <DepositModule />
      <LoanFormConnect haveSigner={!!address}>
        {transactionInProgress || transactionSuccess ? <TransactionTracking /> : <DeployButton />}
      </LoanFormConnect>
    </FormContent>
  )
}

const ScrvUsdWithdrawFormTab = () => {
  const setStakingModule = useStore((state) => state.scrvusd.setStakingModule)
  const previewAction = useStore((state) => state.scrvusd.previewAction)
  const inputAmount = useStore((state) => state.scrvusd.inputAmount)
  const setPreviewReset = useStore((state) => state.scrvusd.setPreviewReset)
  const withdrawTransaction = useStore((state) => state.scrvusd.withdrawTransaction)
  const estimateGasWithdraw = useStore((state) => state.scrvusd.estimateGas.withdraw)
  const { llamaApi: curve = null } = useCurve()
  const { address } = useConnection()

  const transactionInProgress =
    withdrawTransaction.transactionStatus !== '' && withdrawTransaction.transactionStatus !== 'error'
  const transactionSuccess = withdrawTransaction.transactionStatus === 'success'

  useEffect(() => {
    // sync the staking module with the tab mode, needed until we get rid of the store
    setStakingModule('withdraw')
  }, [setStakingModule])

  const [debouncedPreview] = useDebounced(
    useCallback(
      (currentInputAmount: string, hasCurve: boolean) => {
        if (currentInputAmount === '0') return setPreviewReset()
        if (hasCurve) {
          void estimateGasWithdraw(currentInputAmount)
          previewAction('withdraw', currentInputAmount)
        }
      },
      [estimateGasWithdraw, previewAction, setPreviewReset],
    ),
    Duration.FormDebounce,
  )

  useEffect(() => {
    debouncedPreview(inputAmount, !!curve)
  }, [curve, debouncedPreview, inputAmount])

  return (
    <FormContent footer={<TransactionDetails />}>
      <WithdrawModule />
      <LoanFormConnect haveSigner={!!address}>
        {transactionInProgress || transactionSuccess ? <TransactionTracking /> : <DeployButton />}
      </LoanFormConnect>
    </FormContent>
  )
}

const menu = [
  {
    value: 'deposit',
    label: t`Deposit`,
    component: ScrvUsdDepositFormTab,
  },
  {
    value: 'withdraw',
    label: t`Withdraw`,
    component: ScrvUsdWithdrawFormTab,
  },
  {
    value: 'swap',
    label: t`Swap`,
    href: ({ network }) =>
      `${getInternalUrl('dex', network, DEX_ROUTES.PAGE_SWAP)}?from=${CRVUSD_ADDRESS}&to=${SCRVUSD_VAULT_ADDRESS}`,
  },
] satisfies FormTab<NetworkUrlParams>[]

export const DepositWithdraw = ({ params }: DepositWithdrawProps) => <FormTabs params={params} menu={menu} />
