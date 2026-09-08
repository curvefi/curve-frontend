import { shortenAddress } from '@evm-ui/utils'
import { LlamaImg } from '@legacy-ui/images'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type Props = {
  userAddress: Address | undefined
  onClose: () => void
}

/** Gap deviates from Figma as personally 'xs' is too narrow. */
export const UserProfileHeader = ({ userAddress, onClose }: Props) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm }}>
    {userAddress && (
      <>
        <Box component="img" src={LlamaImg} sx={{ height: SizesAndSpaces.IconSize.xl }} alt="Llama Icon" />

        <Typography variant="headingMLight" sx={{ flexGrow: 1 }}>
          {shortenAddress(userAddress)}
        </Typography>
      </>
    )}

    <Stack direction="row" sx={{ ...(!userAddress && { flexGrow: 1 }), justifyContent: 'end' }}>
      <IconButton size="small" onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Stack>
  </Stack>
)
