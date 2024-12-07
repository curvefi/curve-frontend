import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

import SettingsIcon from '@mui/icons-material/Settings'
import CloseIcon from '@mui/icons-material/Close'

import { LlamaImg } from 'ui/src/images'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { addressShort } from '@ui-kit/util'
import type { Address } from '@ui-kit/shared/ui/AddressLabel'

type Props = {
  walletAddress?: Address
  onClose: () => void
}

const LlamaImageSrc = (LlamaImg as unknown as { src: string }).src

/**
 * Gap deviates from Figma as personally 'xs' is too narrow.
 *
 * I know there's <AddressLabel> but not sure how to use it with a different typography,
 * hence I've settled with not using it for the moment
 */
export const Header = ({ walletAddress, onClose }: Props) => (
  <Stack direction="row" alignItems="center" gap={SizesAndSpaces.Spacing.sm}>
    <Box
      component="img"
      src={LlamaImageSrc}
      sx={{
        height: SizesAndSpaces.IconSize.xl,
      }}
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
