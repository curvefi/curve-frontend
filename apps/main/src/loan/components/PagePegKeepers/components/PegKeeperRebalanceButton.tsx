import { useConnection } from 'wagmi'
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
  testId?: string
}

export const PegKeeperRebalanceButton = ({ canRebalance, isRebalancing, onRebalance, testId = 'pegkeeper' }: Props) => {
  const { isConnected, isConnecting } = useConnection()
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
          data-testid={`${testId}-rebalance-button`}
        >
          {isRebalancing ? t`Rebalancing...` : t`Rebalance`}
        </Button>
      ) : (
        <ConnectWalletButton onClick={() => connect()} loading={isConnecting} fullWidth />
      )}
    </Box>
  )
}
