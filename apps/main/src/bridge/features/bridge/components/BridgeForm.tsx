import { useMemo } from 'react'
import { formatUnits } from 'viem'
import { useConnection, useSwitchChain } from 'wagmi'
import { maybe } from '@primitives/objects.utils'
import { useNavigate, usePathname } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { getCurrentApp, getInternalUrl } from '@ui-kit/shared/routes'
import { q } from '@ui-kit/types/util'
import { Chain, decimal, requireBlockchainId } from '@ui-kit/utils'
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
          alertType: 'info' as const,
          message: t`This route is not currently supported. Use the canonical bridge instead.`,
        })
  const routeError = route
    ? undefined
    : t`No FastBridge or LayerZero route supports ${token} from ${networks[chainId]?.name ?? chainId} to ${networks[toChainId]?.name ?? toChainId}.`

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
          error: amountError || routeError ? new Error(amountError ?? routeError) : null,
        })}
        walletBalance={walletBalance}
        inputBalanceUsd={inputBalanceUsd}
        tokenAddress={tokenAddress ?? LAYERZERO_TOKENS[token]}
        tokenBlockchainId={requireBlockchainId(chainId)}
        tokenSymbol={token}
        tokenSelector={<BridgeTokenSelector form={form} token={token} disabled={isPending} />}
        bridgeDisabledAlert={activeAlert}
        disableBridge={disabled}
        loading={!supportedNetworks.length || loading}
        isPending={isPending}
        isApproved={isApproved}
        isConnected={isConnected}
        isWrongNetwork={walletChainId !== chainId}
        onAmount={amount => form.update({ amount })}
        onSubmit={() => void onSubmit()}
        onChangeNetwork={() => switchChain({ chainId })}
        onNetworkSelected={network =>
          navigate(getInternalUrl(getCurrentApp(pathname), requireBlockchainId(network.chainId)))
        }
      />

      <FormAlerts error={error} formErrors={formErrors} handledErrors={['amount']} />
    </Form>
  )
}
