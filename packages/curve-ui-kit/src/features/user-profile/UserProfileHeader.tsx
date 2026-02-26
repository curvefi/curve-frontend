import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import { LlamaImg } from '@ui/images'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { shortenAddress } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type Props = {
  walletAddress?: Address
  onClose: () => void
}

/** Gap deviates from Figma as personally 'xs' is too narrow. */
export const UserProfileHeader = ({ walletAddress, onClose }: Props) => (
  <Stack direction="row" alignItems="center" gap={Spacing.sm}>
    {walletAddress && (
      <>
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
      </>
    )}

    <Stack direction="row" flexGrow={!walletAddress ? 1 : undefined} justifyContent="end">
      <IconButton size="small" onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Stack>
  </Stack>
)
