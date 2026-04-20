import { AlertDisableForm } from '@ui-kit/shared/ui/AlertDisableForm'
import type { BridgeAlert } from '../hooks/useBridgeAlert'
import { BridgeAmount, type BridgeAmountProps } from './BridgeAmount'
import { BridgeButton, type BridgeButtonProps } from './BridgeButton'
import { BridgeTargets, type BridgeTargetsProps } from './BridgeTargets'

export type BridgeFormContentParams = Omit<
  BridgeButtonProps,
  'disableBridge' | 'disableConnect' | 'disableChangeNetwork'
> &
  Pick<BridgeTargetsProps, 'networks' | 'fromChainId' | 'onNetworkSelected'> &
  Pick<BridgeAmountProps, 'amount' | 'onAmount' | 'walletBalance' | 'inputBalanceUsd'> & {
    bridgeDisabledAlert?: Pick<BridgeAlert, 'alertType' | 'message'>
    loading: boolean
    amountError: BridgeAmountProps['error']
  }

export const BridgeFormContent = ({
  networks,
  fromChainId,
  amount,
  amountError,
  walletBalance,
  inputBalanceUsd,
  bridgeDisabledAlert,
  loading,
  isPending,
  isApproved,
  isConnected,
  isConnecting,
  isWrongNetwork,
  onAmount,
  onSubmit,
  onConnect,
  onChangeNetwork,
  onNetworkSelected,
}: BridgeFormContentParams) => (
  <>
    <BridgeTargets
      networks={networks}
      fromChainId={fromChainId}
      disabled={loading}
      loading={loading}
      onNetworkSelected={onNetworkSelected}
    />

    <BridgeAmount
      disabled={loading || !isConnected || isConnecting || !!isWrongNetwork}
      amount={amount}
      walletBalance={walletBalance}
      inputBalanceUsd={inputBalanceUsd}
      error={amountError}
      onAmount={onAmount}
    />

    {bridgeDisabledAlert ? (
      <AlertDisableForm>{bridgeDisabledAlert.message}</AlertDisableForm>
    ) : (
      <BridgeButton
        disableConnect={loading || isConnecting}
        disableChangeNetwork={loading}
        disableBridge={!!amountError || !amount || loading || isApproved == null}
        isPending={isPending}
        isApproved={isApproved}
        isConnected={isConnected}
        isConnecting={isConnecting}
        isWrongNetwork={isWrongNetwork}
        onSubmit={onSubmit}
        onConnect={onConnect}
        onChangeNetwork={onChangeNetwork}
      />
    )}
  </>
)
