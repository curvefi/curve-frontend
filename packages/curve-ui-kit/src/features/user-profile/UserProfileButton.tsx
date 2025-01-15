import IconButton from '@mui/material/IconButton'
import PersonIcon from '@mui/icons-material/Person'
import { useSwitch } from '@ui-kit/hooks/useSwitch'

import { UserProfile } from './UserProfile'

export const UserProfileButton = () => {
  const [isOpen, open, close] = useSwitch()

  return (
    <>
      <IconButton size="small" onClick={open}>
        <PersonIcon />
      </IconButton>

      <UserProfile open={isOpen ?? false} onClose={close} />
    </>
  )
}
