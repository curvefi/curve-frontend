import { useMemo } from 'react'
import { formatUnits } from 'viem'
import { useConnection, useSwitchChain } from 'wagmi'
import { maybe } from '@primitives/objects.utils'
import { useNavigate, usePathname } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { getCurrentApp, getInternalUrl } from '@ui-kit/shared/routes'
import { InlineLink } from '@ui-kit/shared/ui/InlineLink'
import { q } from '@ui-kit/types/util'
import { Chain, decimal } from '@ui-kit/utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import type { BridgeFormParams } from '../BridgeFormTabs'
import type { BridgeAlert } from '../hooks/useBridgeAlert'
import { useBridgeForm } from '../hooks/useBridgeForm'
import { LAYERZERO_TOKENS } from '../layerzero'
import { BridgeActionInfos } from './BridgeActionInfos'
import { BridgeFormContent } from './BridgeFormContent'
import { BridgeTokenSelector } from './BridgeTokenSelector'

export const BridgeForm = ({
  chainId,
  networks,
  bridgeDisabledAlert,
}: BridgeFormParams & { bridgeDisabledAlert?: Pick<BridgeAlert, 'alertType' | 'message'> }) => {
  const { isConnected, chainId: walletChainId } = useConnection()
  const { switchChain } = useSwitchChain()
  const navigate = useNavigate()
  const pathname = usePathname()
  const {
    form,
    values: { amount, token, toChainId },
    route,
    provider,
    supportedNetworks,
    destinationNetworks,
    tokenAddress,
    walletBalance,
    loading,
    isPending,
    isApproved,
    bridgeCost,
    gas,
    amountError,
    error,
    formErrors,
    isKilled,
    disabled,
    onSubmit,
  } = useBridgeForm({ chainId, networks })

  const { data: tokenUsdRate } = useTokenUsdRate({
    chainId: Chain.Ethereum,
    tokenAddress: LAYERZERO_TOKENS[token],
  })
  const inputBalanceUsd = useMemo(
    () => (tokenUsdRate && amount ? decimal(+amount * tokenUsdRate) : undefined),
    [amount, tokenUsdRate],
  )
  const activeAlert =
    bridgeDisabledAlert ??
    (route
      ? isKilled
        ? { alertType: 'error' as const, message: t`This LayerZero bridge route is currently disabled` }
        : undefined
      : {
          alertType: 'warning' as const,
          message: (
            <>
              {t`This route is not currently supported.`}{' '}
              <InlineLink to={`${pathname}?tab=native`}>{t`Use a native bridge instead.`}</InlineLink>
            </>
          ),
        })

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <BridgeActionInfos
          bridgeCost={q({
            data:
              provider === 'layerzero'
                ? maybe(bridgeCost.data, value => Number(formatUnits(value as bigint, 18)))
                : (bridgeCost.data as number | undefined),
            isLoading: bridgeCost.isLoading,
            error: bridgeCost.error,
          })}
          gas={q(gas)}
          isApproved={isApproved}
          nativeTokenSymbol={networks[chainId].symbol}
          provider={provider}
        />
      }
    >
      <BridgeFormContent
        networks={supportedNetworks}
        fromChainId={chainId}
        toChainId={toChainId}
        destinationNetworks={destinationNetworks}
        onDestinationSelected={network => form.update({ toChainId: network.chainId, amount: undefined })}
        amount={q({
          data: amount,
          isLoading: false,
          error: amountError ? new Error(amountError) : null,
        })}
        walletBalance={walletBalance}
        inputBalanceUsd={inputBalanceUsd}
        tokenAddress={tokenAddress ?? LAYERZERO_TOKENS[token]}
        tokenBlockchainId={networks[chainId]?.id ?? 'ethereum'}
        tokenSymbol={token}
        tokenSelector={<BridgeTokenSelector form={form} token={token} disabled={isPending} />}
        bridgeDisabledAlert={activeAlert}
        disableAmount={!route || isKilled}
        disableBridge={disabled}
        loading={!supportedNetworks.length || loading}
        isPending={isPending}
        isApproved={isApproved}
        isConnected={isConnected}
        isWrongNetwork={walletChainId !== chainId}
        onAmount={amount => form.update({ amount })}
        onSubmit={() => void onSubmit()}
        onChangeNetwork={() => switchChain({ chainId })}
        onNetworkSelected={network => navigate(getInternalUrl(getCurrentApp(pathname), network.id))}
      />

      <FormAlerts error={error} formErrors={formErrors} handledErrors={['amount']} />
    </Form>
  )
}
