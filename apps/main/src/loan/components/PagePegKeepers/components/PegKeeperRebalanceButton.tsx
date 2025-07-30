import { useAccount } from 'wagmi'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { ConnectWalletButton } from '@ui-kit/features/connect-wallet/ui/ConnectWalletButton'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type Props = {
  canRebalance: boolean
  isRebalancing: boolean
  onRebalance: () => void
}

export const PegKeeperRebalanceButton = ({ canRebalance, isRebalancing, onRebalance }: Props) => {
  const { isConnected, isConnecting } = useAccount()
  const { connect } = useWallet()

  return (
    <Box sx={{ paddingInline: Spacing.md, paddingBlockEnd: Spacing.md }}>
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
    </Box>
  )
}
