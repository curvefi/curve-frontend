import { useConnection } from 'wagmi'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import { networks, networksIdMapper } from '@/loan/networks'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { FormButton } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { q } from '@ui-kit/types/util'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useScrvUsdWithdrawForm } from './hooks/useScrvUsdWithdrawForm'
import { ScrvUsdWithdrawInfoList } from './ScrvUsdWithdrawInfoList'

export const ScrvUsdWithdrawForm = ({ network }: NetworkUrlParams) => {
  const { isConnected } = useConnection()
  const chainId = networksIdMapper[network]
  const { form, params, isPending, isDisabled, error, formErrors, max, positionBalance, onSubmit } =
    useScrvUsdWithdrawForm({
      chainId,
    })
  const networkConfig = networks[chainId]

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={<ScrvUsdWithdrawInfoList form={form} params={params} networks={networks} />}
    >
      <LoanFormTokenInput
        label={t`Amount to withdraw`}
        token={{ address: SCRVUSD_VAULT_ADDRESS, symbol: 'scrvUSD' }}
        blockchainId={networkConfig.id}
        name="withdrawAmount"
        form={form}
        max={{ ...q(max), fieldName: max.fieldName }}
        testId="scrvusd-withdraw-input"
        network={networkConfig}
        positionBalance={{ position: positionBalance, tooltip: t`scrvUSD balance` }}
        hideBalance={!isConnected}
        disabled={!isConnected}
      />
      <FormButton
        pending={isPending}
        disabled={isDisabled}
        connectWalletTestId="scrvusd-withdraw-connect-wallet-button"
        label={params.isFull ? t`Redeem` : t`Withdraw`}
        testId="scrvusd-withdraw-submit-button"
      />
      <FormAlerts error={error} formErrors={formErrors} handledErrors={['withdrawAmount']} />
    </Form>
  )
}
