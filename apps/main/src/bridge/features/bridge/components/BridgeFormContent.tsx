import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { AlertDisableForm } from '@ui-kit/shared/ui/AlertDisableForm'
import type { BridgeAlert } from '../hooks/useBridgeAlert'
import { BridgeAmount, type BridgeAmountProps } from './BridgeAmount'
import { BridgeButton, type BridgeButtonProps } from './BridgeButton'
import { BridgeTargets, type BridgeTargetsProps } from './BridgeTargets'

export type BridgeFormContentParams = Omit<BridgeButtonProps, 'disableBridge' | 'disableChangeNetwork'> &
  Pick<
    BridgeTargetsProps,
    | 'networks'
    | 'fromChainId'
    | 'onNetworkSelected'
    | 'toChainId'
    | 'destinationNetworks'
    | 'onDestinationSelected'
    | 'onSwapNetworks'
  > &
  Pick<
    BridgeAmountProps,
    'amount' | 'onAmount' | 'walletBalance' | 'inputBalanceUsd' | 'tokenSymbol' | 'tokenSelector'
  > & {
    bridgeDisabledAlert?: Pick<BridgeAlert, 'alertType' | 'message'>
    disableAmount?: boolean
    disableBridge?: boolean
    loading: boolean
  }

export const BridgeFormContent = ({
  networks,
  fromChainId,
  amount,
  walletBalance,
  inputBalanceUsd,
  bridgeDisabledAlert,
  disableAmount = false,
  loading,
  disableBridge,
  isPending,
  isApproved,
  isConnected,
  isWrongNetwork,
  onAmount,
  onSubmit,
  onChangeNetwork,
  onNetworkSelected,
  tokenSymbol,
  tokenSelector,
  toChainId,
  destinationNetworks,
  onDestinationSelected,
  onSwapNetworks,
}: BridgeFormContentParams) => (
  <>
    <BridgeAmount
      disabled={loading || disableAmount}
      amount={amount}
      walletBalance={walletBalance}
      inputBalanceUsd={inputBalanceUsd}
      tokenSymbol={tokenSymbol}
      tokenSelector={tokenSelector}
      onAmount={onAmount}
    />

    <BridgeTargets
      networks={networks}
      fromChainId={fromChainId}
      loading={loading}
      onNetworkSelected={onNetworkSelected}
      toChainId={toChainId}
      destinationNetworks={destinationNetworks}
      onDestinationSelected={onDestinationSelected}
      onSwapNetworks={onSwapNetworks}
    />

    {bridgeDisabledAlert &&
      (bridgeDisabledAlert.alertType === 'error' ? (
        <AlertDisableForm>{bridgeDisabledAlert.message}</AlertDisableForm>
      ) : (
        <Alert variant="outlined" severity={bridgeDisabledAlert.alertType === 'warning' ? 'warning' : 'info'}>
          <AlertTitle>{bridgeDisabledAlert.message}</AlertTitle>
        </Alert>
      ))}
    <BridgeButton
      disableChangeNetwork={loading}
      disableBridge={
        bridgeDisabledAlert != null ||
        disableBridge === true ||
        !!amount.error ||
        !amount.data ||
        loading ||
        isApproved == null
      }
      isPending={isPending}
      isApproved={isApproved}
      isConnected={isConnected}
      isWrongNetwork={isWrongNetwork}
      onSubmit={onSubmit}
      onChangeNetwork={onChangeNetwork}
      tokenSymbol={tokenSymbol}
    />
  </>
)
