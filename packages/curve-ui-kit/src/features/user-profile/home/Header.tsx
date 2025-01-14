import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

import SettingsIcon from '@mui/icons-material/Settings'
import CloseIcon from '@mui/icons-material/Close'

import { LlamaImg } from 'ui/src/images'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { addressShort, type Address } from '@ui-kit/utils'

type Props = {
  walletAddress?: Address
  onClose: () => void
}

const LlamaImageSrc = (LlamaImg as unknown as { src: string }).src

/** Gap deviates from Figma as personally 'xs' is too narrow. */
export const Header = ({ walletAddress, onClose }: Props) => (
  <Stack direction="row" alignItems="center" gap={SizesAndSpaces.Spacing.sm}>
    <Box
      component="img"
      src={LlamaImageSrc}
      sx={{
        height: SizesAndSpaces.IconSize.xl,
      }}
      alt="Llama Icon"
    />

    <Typography variant="headingMLight" flexGrow={1}>
      {addressShort(walletAddress)}
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
