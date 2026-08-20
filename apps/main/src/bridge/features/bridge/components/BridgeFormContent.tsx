import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { AlertDisableForm } from '@ui-kit/shared/ui/AlertDisableForm'
import type { BridgeAlert } from '../hooks/useBridgeAlert'
import { BridgeAmount, type BridgeAmountProps } from './BridgeAmount'
import { BridgeButton, type BridgeButtonProps } from './BridgeButton'
import { BridgeTargets, type BridgeTargetsProps } from './BridgeTargets'

export type BridgeFormContentParams = Omit<
  BridgeButtonProps,
  'disableBridge' | 'disableConnect' | 'disableChangeNetwork'
> &
  Pick<
    BridgeTargetsProps,
    'networks' | 'fromChainId' | 'onNetworkSelected' | 'toChainId' | 'destinationNetworks' | 'onDestinationSelected'
  > &
  Pick<
    BridgeAmountProps,
    | 'amount'
    | 'onAmount'
    | 'walletBalance'
    | 'inputBalanceUsd'
    | 'tokenAddress'
    | 'tokenBlockchainId'
    | 'tokenSymbol'
    | 'tokenSelector'
  > & {
    bridgeDisabledAlert?: Pick<BridgeAlert, 'alertType' | 'message'>
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
  tokenAddress,
  tokenBlockchainId,
  tokenSymbol,
  tokenSelector,
  toChainId,
  destinationNetworks,
  onDestinationSelected,
}: BridgeFormContentParams) => (
  <>
    <BridgeTargets
      networks={networks}
      fromChainId={fromChainId}
      disabled={loading}
      loading={loading}
      onNetworkSelected={onNetworkSelected}
      toChainId={toChainId}
      destinationNetworks={destinationNetworks}
      onDestinationSelected={onDestinationSelected}
    />

    <BridgeAmount
      disabled={loading || !isConnected || !!isWrongNetwork}
      amount={amount}
      walletBalance={walletBalance}
      inputBalanceUsd={inputBalanceUsd}
      tokenAddress={tokenAddress}
      tokenBlockchainId={tokenBlockchainId}
      tokenSymbol={tokenSymbol}
      tokenSelector={tokenSelector}
      onAmount={onAmount}
    />

    {bridgeDisabledAlert &&
      (bridgeDisabledAlert.alertType === 'error' ? (
        <AlertDisableForm>{bridgeDisabledAlert.message}</AlertDisableForm>
      ) : (
        <Alert variant="outlined" severity="info">
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
