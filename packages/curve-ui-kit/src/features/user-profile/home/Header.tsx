import CloseIcon from '@mui/icons-material/Close'
import SettingsIcon from '@mui/icons-material/Settings'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { LlamaImg } from '@ui/images'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type Address, shortenAddress } from '@ui-kit/utils'

type Props = {
  walletAddress?: Address
  onClose: () => void
}

/** Gap deviates from Figma as personally 'xs' is too narrow. */
export const UserProfileHeader = ({ walletAddress, onClose }: Props) => (
  <Stack direction="row" alignItems="center" gap={SizesAndSpaces.Spacing.sm}>
    <Box
      component="img"
      src={LlamaImg}
      sx={{
        height: SizesAndSpaces.IconSize.xl,
      }}
      alt="Llama Icon"
    />

    <Typography variant="headingMLight" flexGrow={1}>
      {shortenAddress(walletAddress)}
    </Typography>

    <Box display="flex">
      <IconButton
        size="small"
        sx={{
          // Settings will be behind a settings page, but for the draft / beta version
          // we put settings temporarily on the home screen.
          display: 'none',
        }}
      >
        <SettingsIcon />
      </IconButton>

      <IconButton size="small" onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Box>
  </Stack>
)
