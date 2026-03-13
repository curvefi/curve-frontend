import Button from '@mui/material/Button'
import { ConnectWalletButton } from '@ui-kit/features/connect-wallet/ui/ConnectWalletButton'
import { t } from '@ui-kit/lib/i18n'

export type BridgeButtonProps = {
  disableBridge: boolean
  disableConnect: boolean
  disableChangeNetwork: boolean
  isPending: boolean | undefined
  isApproved: boolean | undefined
  isConnected: boolean
  isConnecting: boolean
  isWrongNetwork: boolean | undefined
  onSubmit?: () => void
  onConnect: () => void
  onChangeNetwork: () => void
}

export const BridgeButton = ({
  disableBridge,
  disableConnect,
  disableChangeNetwork,
  isPending,
  isApproved,
  isConnected,
  isConnecting,
  isWrongNetwork,
  onSubmit,
  onConnect,
  onChangeNetwork,
}: BridgeButtonProps) =>
  isConnected ? (
    isWrongNetwork ? (
      <Button
        size="small"
        disabled={disableChangeNetwork}
        data-testid="bridge-change-network-button"
        onClick={onChangeNetwork}
      >
        {t`Change network`}
      </Button>
    ) : (
      <Button
        size="small"
        type="submit"
        loading={isPending}
        disabled={disableBridge || isPending}
        data-testid="bridge-submit-button"
        onClick={onSubmit}
      >
        {isPending ? t`Processing...` : isApproved === false ? t`Approve` : t`Bridge crvUSD`}
      </Button>
    )
  ) : (
    <ConnectWalletButton disabled={disableConnect} loading={isConnecting} onClick={onConnect} />
  )
