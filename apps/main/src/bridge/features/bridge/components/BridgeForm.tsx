import { useMemo } from 'react'
import { formatUnits } from 'viem'
import { useConnection, useSwitchChain } from 'wagmi'
import { maybe } from '@primitives/objects.utils'
import { getSearchString, useNavigate, usePathname, useSearchParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { getCurrentApp, getInternalUrl } from '@ui-kit/shared/routes'
import { InlineLink } from '@ui-kit/shared/ui/InlineLink'
import { q } from '@ui-kit/types/util'
import { Chain, decimal } from '@ui-kit/utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { NATIVE_BRIDGES } from '../../bridges/bridges'
import type { BridgeFormParams } from '../BridgeFormTabs'
import type { BridgeAlert } from '../hooks/useBridgeAlert'
import { useBridgeForm } from '../hooks/useBridgeForm'
import { getBridgeRoute, LAYERZERO_TOKENS } from '../layerzero'
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
  const searchParams = useSearchParams()
  const ethereumChainId = networks[Chain.Ethereum].chainId
  const destinationChainId = Object.values(networks).find(({ id }) => id === searchParams.get('destination'))?.chainId
  const {
    form,
    values: { amount, token, toChainId },
    route,
    provider,
    supportedNetworks,
    destinationNetworks,
    walletBalance,
    loading,
    isPending,
    isApproved,
    bridgeCost,
    gas,
    amountError,
    layerZeroCapacityAvailable,
    layerZeroCapacityExceeded,
    layerZeroCapacityError,
    layerZeroCapacityLoading,
    error,
    formErrors,
    isKilled,
    disabled,
    onSubmit,
  } = useBridgeForm({ chainId, networks, destinationChainId })

  const navigateToNetwork = (networkId: string, destinationId?: string) =>
    navigate(
      getInternalUrl(getCurrentApp(pathname), networkId) +
        getSearchString({ destination: destinationId ?? null }, searchParams),
    )

  const { data: tokenUsdRate } = useTokenUsdRate({
    chainId: Chain.Ethereum,
    tokenAddress: LAYERZERO_TOKENS[token],
  })
  const inputBalanceUsd = useMemo(
    () => (tokenUsdRate && amount ? decimal(+amount * tokenUsdRate) : undefined),
    [amount, tokenUsdRate],
  )
  const nativeNetwork = networks[chainId === ethereumChainId ? toChainId : chainId]
  const nativeBridgeUrl = NATIVE_BRIDGES.find(({ imageId }) => imageId === `chains/${nativeNetwork?.id}.png`)?.appUrl
  const activeAlert =
    bridgeDisabledAlert ??
    (route
      ? isKilled
        ? { alertType: 'error' as const, message: t`This LayerZero bridge route is currently disabled` }
        : layerZeroCapacityError
          ? { alertType: 'error' as const, message: t`Destination capacity could not be checked. Try again later.` }
          : undefined
      : {
          alertType: 'warning' as const,
          message: (
            <>
              {t`This route is not currently supported.`}{' '}
              {nativeBridgeUrl ? (
                <InlineLink to={nativeBridgeUrl}>{t`Use the network's native bridge instead.`}</InlineLink>
              ) : (
                t`Use a native bridge instead.`
              )}
            </>
          ),
        })
  const capacityWarning = layerZeroCapacityExceeded
    ? token === 'CRV'
      ? t`This transfer exceeds the CRV currently available on the destination. Reduce the amount before bridging.`
      : t`This transfer exceeds today's remaining destination capacity. Reduce the amount before bridging.`
    : undefined

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
          layerZeroCapacity={
            provider === 'layerzero'
              ? q({
                  data: maybe(layerZeroCapacityAvailable, value => `${formatUnits(value, 18)} ${token}`),
                  isLoading: layerZeroCapacityLoading,
                  error: layerZeroCapacityError ?? null,
                })
              : undefined
          }
          layerZeroCapacityWarning={capacityWarning}
        />
      }
    >
      <BridgeFormContent
        networks={supportedNetworks}
        fromChainId={chainId}
        toChainId={toChainId}
        destinationNetworks={destinationNetworks}
        onDestinationSelected={network =>
          navigate(pathname + getSearchString({ destination: network.id }, searchParams), { replace: true })
        }
        onSwapNetworks={
          getBridgeRoute({ fromChainId: toChainId, toChainId: chainId, token })
            ? () =>
                navigateToNetwork(
                  networks[toChainId].id,
                  toChainId === ethereumChainId ? networks[chainId].id : undefined,
                )
            : undefined
        }
        amount={q({
          data: amount,
          isLoading: false,
          error: amountError ? new Error(amountError) : null,
        })}
        walletBalance={walletBalance}
        inputBalanceUsd={inputBalanceUsd}
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
        onNetworkSelected={network =>
          navigateToNetwork(
            network.id,
            network.chainId === ethereumChainId &&
              getBridgeRoute({ fromChainId: ethereumChainId, toChainId: chainId, token })
              ? networks[chainId].id
              : undefined,
          )
        }
      />

      <FormAlerts error={error} formErrors={formErrors} handledErrors={['amount']} />
    </Form>
  )
}
