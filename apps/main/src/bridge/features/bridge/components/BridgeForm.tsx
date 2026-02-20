import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { q } from '@ui-kit/types/util'
import { Chain, CRVUSD_ADDRESS, decimal } from '@ui-kit/utils'
import { updateForm } from '@ui-kit/utils/react-form.utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import type { BridgeFormParams } from '../BridgeFormTabs'
import { useBridgeForm } from '../hooks/useBridgeForm'
import { BridgeActionInfos } from './BridgeActionInfos'
import { BridgeFormContent } from './BridgeFormContent'
import { BridgeInfoAlert } from './BridgeInfoAlert'

/** Hooks up the bridge form content with an actual form and hooks */
export const BridgeForm = ({ chainId, networks }: BridgeFormParams) => {
  const { isConnected, isConnecting } = useConnection()
  const { connect } = useWallet()

  const {
    form,
    values: { fromChainId, amount },
    loading,
    walletBalance,
    supportedNetworks,
    isPending,
    isApproved,
    isBridged,
    txHash,
    bridgeCost,
    gas,
    amountError,
    approveError,
    bridgeError,
    formErrors,
    onSubmit,
  } = useBridgeForm({ chainId, networks })

  // Fetch usd rate for input usd value. We only care about the mainnet rate.
  const { data: crvUsdRate } = useTokenUsdRate({ chainId: Chain.Ethereum, tokenAddress: CRVUSD_ADDRESS })
  const inputBalanceUsd = useMemo(
    () => (crvUsdRate && amount ? decimal(+amount * crvUsdRate) : undefined),
    [amount, crvUsdRate],
  )

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <>
          <BridgeActionInfos bridgeCost={q(bridgeCost)} gas={q(gas)} isApproved={isApproved.data} />
          <BridgeInfoAlert />
        </>
      }
    >
      <BridgeFormContent
        networks={supportedNetworks}
        fromChainId={fromChainId}
        amount={amount}
        amountError={amountError}
        walletBalance={walletBalance}
        inputBalanceUsd={inputBalanceUsd}
        loading={!supportedNetworks.length || loading}
        isPending={isPending}
        isApproved={isApproved?.data}
        isConnected={isConnected}
        isConnecting={isConnecting}
        isWrongNetwork={fromChainId != null && chainId !== fromChainId}
        onAmount={(amount) => updateForm(form, { amount })}
        onConnect={() => connect()}
      />

      <FormAlerts
        isSuccess={isBridged}
        error={approveError || bridgeError}
        txHash={txHash}
        formErrors={formErrors}
        network={networks[chainId]}
        handledErrors={['amount']}
        successTitle={t`Bridged`}
      />
    </Form>
  )
}
