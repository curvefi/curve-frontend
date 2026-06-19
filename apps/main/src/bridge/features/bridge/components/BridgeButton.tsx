import Button from '@mui/material/Button'
import { ConnectWalletButton } from '@ui-kit/features/connect-wallet/ui/ConnectWalletButton'
import { t } from '@ui-kit/lib/i18n'

export type BridgeButtonProps = {
  disableBridge: boolean
  disableChangeNetwork: boolean
  isPending: boolean | undefined
  isApproved: boolean | undefined
  isConnected: boolean
  isWrongNetwork: boolean | undefined
  onSubmit?: () => void
  onChangeNetwork: () => void
}

export const BridgeButton = ({
  disableBridge,
  disableChangeNetwork,
  isPending,
  isApproved,
  isConnected,
  isWrongNetwork,
  onSubmit,
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
    <ConnectWalletButton />
  )
