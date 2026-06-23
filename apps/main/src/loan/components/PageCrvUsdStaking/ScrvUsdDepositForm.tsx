import { useConnection } from 'wagmi'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { networks, networksIdMapper } from '@/loan/networks'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { FormButton } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { q } from '@ui-kit/types/util'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useScrvUsdDepositForm } from './hooks/useScrvUsdDepositForm'
import { ScrvUsdDepositInfoList } from './ScrvUsdDepositInfoList'

export const ScrvUsdDepositForm = ({ network }: NetworkUrlParams) => {
  const { isConnected } = useConnection()
  const chainId = networksIdMapper[network]
  const {
    form,
    params,
    approveInfinite,
    isApproved,
    isPending,
    isDisabled,
    error,
    formErrors,
    max,
    onApproveInfiniteToggle,
    onSubmit,
  } = useScrvUsdDepositForm({ chainId })
  const networkConfig = networks[chainId]
  return (
    <Form
      {...form}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Form submit handlers are async through react-hook-form.
      onSubmit={onSubmit}
      footer={
        <ScrvUsdDepositInfoList
          chainId={chainId}
          params={params}
          isOpen={form.isTouched('depositAmount')}
          isApproved={isApproved.data}
          approveInfinite={approveInfinite}
          onApproveInfiniteToggle={onApproveInfiniteToggle}
        />
      }
    >
      <LoanFormTokenInput
        label={t`Amount to deposit`}
        token={{ address: CRVUSD_ADDRESS, symbol: 'crvUSD' }}
        blockchainId={networkConfig.id}
        name="depositAmount"
        form={form}
        max={{ ...q(max), fieldName: max.fieldName }}
        testId="scrvusd-deposit-input"
        network={networkConfig}
        hideBalance={!isConnected}
        disabled={!isConnected}
      />
      <FormButton
        pending={isPending}
        disabled={isDisabled}
        connectWalletTestId="scrvusd-deposit-connect-wallet-button"
        label={[isApproved.data === false && t`Approve`, t`Deposit`]}
        testId="scrvusd-deposit-submit-button"
      />
      <FormAlerts error={error} formErrors={formErrors} handledErrors={['depositAmount']} />
    </Form>
  )
}
