import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import { LlamaIcon } from '@ui/icons/LlamaIcon'
import { Settings } from './settings/Settings'
import { UserProfileHeader } from './UserProfileHeader'

const { Spacing, Width } = SizesAndSpaces

export const UserProfile = ({
  address,
  addressLabel,
}: {
  address: Address | undefined
  addressLabel: string | undefined
}) => {
  const [isOpen, open, close] = useSwitch(false)
  return (
    <>
      <IconButton size="small" onClick={open} data-testid="user-profile-button">
        <LlamaIcon />
      </IconButton>
      <Drawer
        open={isOpen}
        anchor="right"
        onClose={close}
        slotProps={{
          paper: {
            sx: {
              minWidth: Width.modal.lg,
              paddingInline: Spacing.md,
              paddingBlock: Spacing.lg,
              backgroundColor: t => t.design.Layer[1].Fill,
            },
          },
        }}
      >
        <Stack sx={{ gap: Spacing.md }}>
          <UserProfileHeader userAddress={address} addressLabel={addressLabel} onClose={close} />
          <Settings />
        </Stack>
      </Drawer>
    </>
  )
}
