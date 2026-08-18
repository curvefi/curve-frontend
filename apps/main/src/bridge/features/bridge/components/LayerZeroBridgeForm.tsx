import { useMemo } from 'react'
import { formatUnits } from 'viem'
import { useConnection, useSwitchChain } from 'wagmi'
import MenuItem from '@mui/material/MenuItem'
import { maybe } from '@primitives/objects.utils'
import type { BaseConfig } from '@ui/utils'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { Select } from '@ui-kit/shared/ui/Select'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { q } from '@ui-kit/types/util'
import { Chain, decimal, requireBlockchainId } from '@ui-kit/utils'
import { Form } from '@ui-kit/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { useLayerZeroBridgeForm } from '../hooks/useLayerZeroBridgeForm'
import { LAYERZERO_TOKENS, type LayerZeroToken } from '../layerzero'
import { BridgeActionInfos } from './BridgeActionInfos'
import { BridgeFormContent } from './BridgeFormContent'
import { BridgeInfoAlert } from './BridgeInfoAlert'

const TOKENS = ['CRV', 'crvUSD', 'scrvUSD'] as const

export const LayerZeroBridgeForm = ({
  chainId,
  networks,
}: {
  chainId: number
  networks: Record<number, BaseConfig>
}) => {
  const { isConnected, chainId: walletChainId } = useConnection()
  const { switchChain } = useSwitchChain()
  const {
    form,
    values: { amount, token, toChainId },
    route,
    supportedNetworks,
    destinationNetworks,
    walletBalance,
    quote,
    isKilled,
    isApproved,
    amountError,
    gas,
    isPending,
    error,
    disabled,
    onSubmit,
  } = useLayerZeroBridgeForm({ chainId, networks })

  const { data: tokenUsdRate } = useTokenUsdRate({
    chainId: Chain.Ethereum,
    tokenAddress: LAYERZERO_TOKENS[token][Chain.Ethereum],
  })
  const inputBalanceUsd = useMemo(
    () => (tokenUsdRate && amount ? decimal(+amount * tokenUsdRate) : undefined),
    [amount, tokenUsdRate],
  )

  const tokenSelector = (
    <Select
      data-testid="bridge-token-select"
      variant="ghost"
      value={token}
      onChange={event => form.update({ token: event.target.value as LayerZeroToken, amount: undefined })}
      renderValue={value => (
        <TokenLabel
          blockchainId={requireBlockchainId(chainId)}
          address={LAYERZERO_TOKENS[value as LayerZeroToken][chainId as keyof typeof LAYERZERO_TOKENS.CRV]}
          label={value as string}
        />
      )}
    >
      {TOKENS.map(symbol => (
        <MenuItem key={symbol} value={symbol}>
          {symbol}
        </MenuItem>
      ))}
    </Select>
  )

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      footer={
        <>
          <BridgeActionInfos
            bridgeCost={q({
              data: maybe(quote.data, value => Number(formatUnits(value, 18))),
              isLoading: quote.isLoading,
              error: quote.error,
            })}
            gas={q(gas)}
            isApproved={isApproved}
            nativeTokenSymbol={networks[chainId].symbol}
          />
          <BridgeInfoAlert mode="layerzero" />
        </>
      }
    >
      <BridgeFormContent
        networks={supportedNetworks}
        fromChainId={chainId}
        toChainId={toChainId}
        destinationNetworks={destinationNetworks}
        onDestinationSelected={network => form.update({ toChainId: network.chainId, amount: undefined })}
        amount={q({ data: amount, isLoading: false, error: amountError ? new Error(amountError) : null })}
        walletBalance={{ balance: walletBalance.data }}
        inputBalanceUsd={inputBalanceUsd}
        tokenAddress={route?.tokenAddress ?? LAYERZERO_TOKENS[token][Chain.Ethereum]}
        tokenBlockchainId={requireBlockchainId(chainId)}
        tokenSymbol={token}
        tokenSelector={tokenSelector}
        bridgeDisabledAlert={
          isKilled.data
            ? { alertType: 'error', message: 'This LayerZero bridge route is currently disabled' }
            : undefined
        }
        disableBridge={disabled}
        loading={!route || quote.isLoading || isKilled.isLoading || walletBalance.isLoading}
        isPending={isPending}
        isApproved={isApproved}
        isConnected={isConnected}
        isWrongNetwork={walletChainId !== chainId}
        onAmount={amount => form.update({ amount })}
        onSubmit={undefined}
        onChangeNetwork={() => switchChain({ chainId })}
      />
      <FormAlerts error={error} formErrors={form.formState.visibleErrors} handledErrors={['amount']} />
    </Form>
  )
}
