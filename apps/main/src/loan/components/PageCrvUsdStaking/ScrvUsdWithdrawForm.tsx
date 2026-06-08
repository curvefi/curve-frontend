import { useConnection } from 'wagmi'
import { LoanFormTokenInput } from '@/llamalend/widgets/action-card/LoanFormTokenInput'
import { SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import { networks, networksIdMapper } from '@/loan/networks'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import Button from '@mui/material/Button'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { ConnectWalletButton } from '@ui-kit/features/connect-wallet/ui/ConnectWalletButton'
import { t } from '@ui-kit/lib/i18n'
import { q } from '@ui-kit/types/util'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useScrvUsdWithdrawForm } from './hooks/useScrvUsdWithdrawForm'
import { ScrvUsdWithdrawInfoList } from './ScrvUsdWithdrawInfoList'

export const ScrvUsdWithdrawForm = ({ network }: NetworkUrlParams) => {
  const { isConnected, isConnecting } = useConnection()
  const { connect } = useWallet()
  const chainId = networksIdMapper[network]
  const { form, params, isPending, isDisabled, error, formErrors, max, positionBalance, onSubmit } =
    useScrvUsdWithdrawForm({
      chainId,
    })
  const networkConfig = networks[chainId]

  return (
    <Form
      {...form}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Form submit handlers are async through react-hook-form.
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
      {isConnected ? (
        <Button type="submit" loading={isPending} disabled={isDisabled} data-testid="scrvusd-withdraw-submit-button">
          {isPending ? t`Processing...` : t`Withdraw`}
        </Button>
      ) : (
        <ConnectWalletButton
          type="button"
          size="large"
          loading={isConnecting}
          onClick={() => void connect()}
          data-testid="scrvusd-withdraw-connect-wallet-button"
        />
      )}
      <FormAlerts error={error} formErrors={formErrors} handledErrors={['withdrawAmount']} />
    </Form>
  )
}
