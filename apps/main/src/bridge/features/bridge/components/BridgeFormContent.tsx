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
  }

export const BridgeFormContent = ({
  networks,
  fromChainId,
  amount,
  walletBalance,
  inputBalanceUsd,
  bridgeDisabledAlert,
  loading,
  isPending,
  isApproved,
  isConnected,
  isWrongNetwork,
  onAmount,
  onSubmit,
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
      disabled={loading || !isConnected || !!isWrongNetwork}
      amount={amount}
      walletBalance={walletBalance}
      inputBalanceUsd={inputBalanceUsd}
      onAmount={onAmount}
    />

    {bridgeDisabledAlert ? (
      <AlertDisableForm>{bridgeDisabledAlert.message}</AlertDisableForm>
    ) : (
      <BridgeButton
        disableChangeNetwork={loading}
        disableBridge={!!amount.error || !amount.data || loading || isApproved == null}
        isPending={isPending}
        isApproved={isApproved}
        isConnected={isConnected}
        isWrongNetwork={isWrongNetwork}
        onSubmit={onSubmit}
        onChangeNetwork={onChangeNetwork}
      />
    )}
  </>
)
