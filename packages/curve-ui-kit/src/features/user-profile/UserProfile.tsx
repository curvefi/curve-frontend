import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'
import { ConnectWalletIndicatorProps } from 'curve-common/src/features/connect-wallet'

import { Home } from './home/Home'

type Props = {
  open: boolean
  onClose: () => void
  walletAddress: NonNullable<ConnectWalletIndicatorProps['walletAddress']>
}

export const UserProfile = ({ open, onClose, walletAddress }: Props) => (
  <Drawer open={open} anchor="right" onClose={onClose}>
    <Box
      sx={{
        minWidth: '500px', // Hardcoded for now as per Figma design
        paddingInline: SizesAndSpaces.Spacing.md,
        paddingBlock: SizesAndSpaces.Spacing.lg,
        backgroundColor: (t) => t.design.Layer[1].Fill,
      }}
    >
      <Home walletAddress={walletAddress} onClose={onClose} />
    </Box>
  </Drawer>
)
