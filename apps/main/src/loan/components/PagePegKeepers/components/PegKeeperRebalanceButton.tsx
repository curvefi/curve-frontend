import { useConnection } from 'wagmi'
import { ConnectEvmWalletButton } from '@evm-ui/features/connect-wallet/ui/ConnectEvmWalletButton'
import Button from '@mui/material/Button'
import { t } from '@ui/lib/i18n'

type Props = {
  canRebalance: boolean
  isRebalancing: boolean
  onRebalance: () => void
  testId?: string
}

export const PegKeeperRebalanceButton = ({ canRebalance, isRebalancing, onRebalance, testId = 'pegkeeper' }: Props) => {
  const { isConnected } = useConnection()
  return isConnected ? (
    <Button
      variant="contained"
      color="primary"
      disabled={!canRebalance || isRebalancing}
      onClick={onRebalance}
      fullWidth
      data-testid={`${testId}-rebalance-button`}
    >
      {isRebalancing ? t`Rebalancing...` : t`Rebalance`}
    </Button>
  ) : (
    <ConnectEvmWalletButton testId="pegkeeper-connect-wallet" fullWidth />
  )
}
