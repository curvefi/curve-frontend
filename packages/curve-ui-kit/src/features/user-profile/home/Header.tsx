import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

import SettingsIcon from '@mui/icons-material/Settings'
import CloseIcon from '@mui/icons-material/Close'

import { LlamaImg } from 'ui/src/images'
import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'
import { ConnectWalletIndicatorProps } from 'curve-common/src/features/connect-wallet'

type Props = {
  walletAddress: NonNullable<ConnectWalletIndicatorProps['walletAddress']>
  onClose: () => void
}

const LlamaImageSrc = (LlamaImg as unknown as { src: string }).src
const Llama = styled('img')({
  height: '40px',
})

/**
 * Gap deviates from Figma as personally 'xs' is too narrow.
 *
 * I know there's <AddressLabel> but not sure how to use it with a different typography,
 * hence I've settled with not using it for the moment
 */
export const Header = ({ walletAddress, onClose }: Props) => (
  <Box display="flex" alignItems="center" gap={SizesAndSpaces.Spacing.sm}>
    <Llama src={LlamaImageSrc} />

    <Typography variant="headingMLight" flexGrow={1}>
      {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
    </Typography>

    <Box display="flex">
      <IconButton size="small">
        <SettingsIcon />
      </IconButton>

      <IconButton size="small" onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Box>
  </Box>
)
