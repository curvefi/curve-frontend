import { useAccount } from 'wagmi'
import PersonIcon from '@mui/icons-material/Person'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { Settings } from '@ui-kit/features/user-profile/settings/Settings'
import { UserProfileHeader } from '@ui-kit/features/user-profile/UserProfileHeader'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, Width } = SizesAndSpaces

export const UserProfile = () => {
  const [isOpen, open, close] = useSwitch(false)
  const { address: walletAddress } = useAccount()
  return (
    <>
      <IconButton size="small" onClick={open} data-testid="user-profile-button">
        <PersonIcon />
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
              backgroundColor: (t) => t.design.Layer[1].Fill,
            },
          },
        }}
      >
        <Stack gap={Spacing.md}>
          <UserProfileHeader walletAddress={walletAddress} onClose={close} />
          <Settings />
        </Stack>
      </Drawer>
    </>
  )
}
