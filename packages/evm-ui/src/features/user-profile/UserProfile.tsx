import { useConnection } from 'wagmi'
import { Settings } from '@evm-ui/features/user-profile/settings/Settings'
import { UserProfileHeader } from '@evm-ui/features/user-profile/UserProfileHeader'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import { LlamaIcon } from '@ui/icons/LlamaIcon'

const { Spacing, Width } = SizesAndSpaces

export const UserProfile = () => {
  const [isOpen, open, close] = useSwitch(false)
  const { address: walletAddress } = useConnection()
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
          <UserProfileHeader walletAddress={walletAddress} onClose={close} />
          <Settings />
        </Stack>
      </Drawer>
    </>
  )
}
