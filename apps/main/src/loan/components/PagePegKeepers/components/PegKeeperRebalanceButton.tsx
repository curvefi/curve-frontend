import { useAccount } from 'wagmi'
import { CardContent } from '@mui/material'
import Button from '@mui/material/Button'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { ConnectWalletButton } from '@ui-kit/features/connect-wallet/ui/ConnectWalletButton'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  canRebalance: boolean
  isRebalancing: boolean
  onRebalance: () => void
}

export const PegKeeperRebalanceButton = ({ canRebalance, isRebalancing, onRebalance }: Props) => {
  const { isConnected, isConnecting } = useAccount()
  const { connect } = useWallet()

  return (
    <CardContent>
      {isConnected ? (
        <Button
          variant="contained"
          color="primary"
          disabled={!canRebalance || isRebalancing}
          onClick={onRebalance}
          fullWidth
        >
          {isRebalancing ? t`Rebalancing...` : t`Rebalance`}
        </Button>
      ) : (
        <ConnectWalletButton onClick={() => connect()} loading={isConnecting} fullWidth />
      )}
    </CardContent>
  )
}
